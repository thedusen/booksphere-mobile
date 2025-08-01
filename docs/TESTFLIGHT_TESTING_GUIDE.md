# Booksphere TestFlight Testing Guide

Welcome to the Booksphere beta testing program! This guide will help you get started with testing our mobile app.

## Getting Started

### 1. Accept TestFlight Invitation

1. Check your email for the TestFlight invitation
2. Open the email on your iPhone or iPad
3. Tap **View in TestFlight**
4. If you don't have TestFlight installed, download it from the App Store first
5. Accept the invitation and tap **Install** to download Booksphere

### 2. Login Credentials

Use one of these test accounts to log in:

```
Email: test1@booksphere.com
Password: TestUser123!

Email: test2@booksphere.com
Password: TestUser123!

Email: test3@booksphere.com
Password: TestUser123!
```

## Key Features to Test

### 📸 Book Cataloging (Primary Feature)

This is our most important feature - please test thoroughly!

1. From the home screen, tap **"Catalog New Book"**
2. You'll be guided through 3 photo captures:
   - **Cover Photo**: Point at the book's front cover
   - **Title Page**: Open the book to the title page
   - **Copyright Page**: Find the page with ISBN/publisher info
3. After taking all 3 photos, tap **Submit**
4. Go to **"Catalog Jobs"** to watch the processing
5. Once complete, review the extracted information
6. Edit if needed and add to inventory

**What to Test:**
- Try different lighting conditions
- Test with various book sizes
- Try books with damaged covers
- Test with both old and new books

### 📚 Inventory Management

1. Tap **"View Inventory"** from the home screen
2. Try these actions:
   - Search for books by title or author
   - Use the filter buttons (All, In Stock, Out of Stock)
   - Tap on a book to see details
   - Check different editions of the same book

### ✏️ Manual Entry

1. Tap **"Manual Entry"** from home screen
2. Fill in book details:
   - Title (required)
   - Author
   - ISBN
   - Condition
   - Price
   - Location
3. Save to inventory

## What We're Looking For

### Please Pay Attention To:

1. **Crashes or Freezes**
   - Note what you were doing when it happened
   - Try to reproduce the issue

2. **Camera Issues**
   - Does the camera open properly?
   - Are photos clear and properly captured?
   - Any permission issues?

3. **Data Accuracy**
   - Is the book information extracted correctly?
   - Are search results accurate?
   - Do filters work as expected?

4. **Performance**
   - Does the app feel fast and responsive?
   - Any long loading times?
   - Smooth scrolling in inventory list?

5. **User Experience**
   - Is anything confusing or hard to find?
   - Are error messages helpful?
   - Any features you expected but couldn't find?

## Reporting Issues

### When You Find a Problem:

1. **Take a Screenshot**
   - Press Power + Volume Up buttons together
   - The screenshot saves to your Photos

2. **Note These Details:**
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?
   - Can you make it happen again?

3. **Send Feedback**
   - In TestFlight, tap **Send Beta Feedback**
   - Or email us directly with screenshots and details

### Feedback Template

```
Feature: [e.g., Book Cataloging, Inventory Search]
Issue Type: [Bug, Suggestion, Confusion]
Description: [What happened]
Steps to Reproduce:
1. [First step]
2. [Second step]
3. [What went wrong]
Expected: [What should have happened]
Device: [Your iPhone/iPad model]
```

## Testing Checklist

Work through this list during your testing:

- [ ] Successfully logged in with test account
- [ ] Cataloged at least 3 books using camera
- [ ] Searched for a book in inventory
- [ ] Used all three filter options
- [ ] Viewed book details
- [ ] Added a book manually
- [ ] Tested in both portrait and landscape (iPad)
- [ ] Tried using the app offline briefly
- [ ] Logged out and logged back in

## Tips for Effective Testing

1. **Use Real Books**: Test with actual books you have available
2. **Try Edge Cases**: What happens with very long titles? Missing ISBNs?
3. **Test Permissions**: Deny camera access initially, then grant it
4. **Network Testing**: Try on WiFi and cellular
5. **Be Thorough**: Don't just do the happy path - try to break things!

## Frequently Asked Questions

**Q: The camera won't open. What should I do?**
A: Go to Settings → Booksphere → Enable Camera access

**Q: Can I use my own account instead of test accounts?**
A: Please use only the provided test accounts during beta testing

**Q: How long should I test?**
A: Try to use the app for at least 30 minutes across different sessions

**Q: Can I share the app with others?**
A: Please don't share the TestFlight link. We'll expand testing later

**Q: Will my test data be saved?**
A: No, all test data will be cleared before public release

## Thank You!

Your feedback is invaluable in making Booksphere better. We appreciate your time and effort in testing our app. Every bug you find and suggestion you make helps us create a better experience for book dealers everywhere.

Happy Testing!
The Booksphere Team