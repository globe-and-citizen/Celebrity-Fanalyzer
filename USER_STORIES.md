# User Stories

The following user stories should be runnable without error in production.

## Template

**As a:** (Describe the user and set out the starting setup or application state)

**want to:** (Describe what the user wants to do)

**that:** (Describe why the user wnats to do it)

**When I Do => I Get:** (Describe the action(s) taken by the user and the feedback they get with each step to know that they are successful.)

## Story 1

**As an:** Anonymous first time user, working on a desktop computer running Chrome. I don't fully trust the website and so I want to sign in with a fake email account and NOT with Google.

**I want to:** Log in to participate in the competition.

**So that:** I can see my opinion posted on the application.

**When I Do => I Get:**

1. Navigate to https://celebrity-fanalyzer.pages.dev/
2. Navigate to the profile page and choose `SIGN UP`
3. Navigate to the `ADMIN` panel.
4. Chose `New Entry`
   - Chose the appropriate month prompt
   - Add a title
   - Write my description
   - Add an image
   - Submit entry which shows a green `Enstry Successfully Submitted` drop down. The "Edit Entry Dialogue Card" then closes so that I can't re-submit accidentally the same entry.
5. When I navigate to `Search`, and chose the appropriate month prompt, I can see my own entry
6. I `Like` my own entry and see the icon go bold.
7. I `Share` my own entry, and successfully post the link to my `Facebook`.

## Story 2

**As an:** Anonymous friend of a user who asked me to vote, I am following the link on my iPhone. I have never heard of Celebrity Fanalyzer. I am just following a link that my friend posted on their social media.

**I want to:** Help my friend by encouraging them with a vote and a comment.

**So that:** They can see my vote cast and have the statistics regitered on the application.

**When I Do => I Get:**

1. Navigate directly to https://celebrity-fanalyzer.pages.dev/2023/03/`my-friends-entry`
2. The page loads quickly and I can easily scroll to the bottom of the page
3. Where I can vote by choosing `like`, I see the thumb turn bolded green.
4. I then read my friend's entry by scrolling to the top of the page and reading.
5. I swipe to the right to look at the anthrogram, and my like is represented there.
6. I swipe to the right again where I:
   - Leave a comment anonymously and see it posted immediately
   - Reply to a comment I disagree with and see it posted immediately
   - Like a comment I agree with and see the like icon bolded immediately
   - Dislike a comment I disagree with and the the dislike icon bolded immediately

## Story 3

**As an:** Editor of the website,

**I want to:** Delete an offensive entry and edit another.

**So that:** The website is hate and intimidation free.

**When I Do => I Get:**

1. Navigate directly to https://celebrity-fanalyzer.pages.dev/admin
2. Click the drop down menu beside the prompt where the entry is associated.
3. Choose the `Delete` garbage can icon and chose `DELETE`and then see the red confirmation "Entry Deleted"
4. Next I choose the `Edit` pencil icon. I am going to:
   - change the title of the entry.
   - change the description of the entry.
   - change the picture of the entry.
5. When I click `SUBMIT ENTRY` I see a blue confirmation drop down of "Entry successfully edited". The "Edit Entry Dialogue Card" then closes so that I can't re-submit accidentally the same entry.
6. I navigate to search where I see that the entry I deleted is gone and the entry that I edited is changed.
