-- Fix cataloging outbox RLS policy for trigger operations
-- This migration addresses the RLS violation when deleting cataloging jobs

-- Drop and recreate the trigger function with SECURITY DEFINER
-- so it can write to the outbox table regardless of the calling user's permissions
DROP FUNCTION IF EXISTS cataloging_outbox_trigger() CASCADE;

CREATE OR REPLACE FUNCTION cataloging_outbox_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to run with elevated privileges
SET search_path = public
AS $function$
BEGIN
    -- Skip unchanged status updates to reduce event noise
    IF TG_OP = 'UPDATE' AND (
        OLD.status IS NOT DISTINCT FROM NEW.status AND
        OLD.updated_at IS NOT DISTINCT FROM NEW.updated_at
    ) THEN
        RETURN NEW;
    END IF;

    -- Insert event into outbox with explicit organization context
    -- Set the current organization context for the outbox RLS policy
    PERFORM set_config('app.current_org_id', COALESCE(NEW.organization_id, OLD.organization_id)::text, true);
    
    INSERT INTO cataloging_event_outbox (
        organization_id,
        event_type,
        entity_type,
        entity_id,
        event_data,
        created_at
    ) VALUES (
        COALESCE(NEW.organization_id, OLD.organization_id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'created'
            WHEN 'UPDATE' THEN 'updated'
            WHEN 'DELETE' THEN 'deleted'
        END,
        'cataloging_job',
        COALESCE(NEW.job_id, OLD.job_id),  -- Use job_id, not id
        jsonb_build_object(
            'job_id', COALESCE(NEW.job_id, OLD.job_id),
            'status', COALESCE(NEW.status, OLD.status),
            'updated_at', COALESCE(NEW.updated_at, OLD.updated_at)
        ),
        NOW()
    );

    -- Clear the organization context after use
    PERFORM set_config('app.current_org_id', null, true);

    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS cataloging_jobs_outbox_trigger ON cataloging_jobs;
CREATE TRIGGER cataloging_jobs_outbox_trigger
    AFTER INSERT OR UPDATE OR DELETE ON cataloging_jobs
    FOR EACH ROW
    EXECUTE FUNCTION cataloging_outbox_trigger();

-- Add a comment explaining the fix
COMMENT ON FUNCTION cataloging_outbox_trigger() IS 'Trigger function with SECURITY DEFINER to handle outbox events for cataloging jobs. Uses app.current_org_id setting to satisfy RLS policies.';