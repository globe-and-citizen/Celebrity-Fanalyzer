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
3. Navigate to the `SETTINGS PANE` of the profile panel & request access as a writer.
4. (Use a separate Admin account to then grant privileges to the new user.) 
5. As the newly created user once again, chose `New Entry`
   - Chose the appropriate month prompt
   - Add a title
   - Write my description
   - Add an image
   - Submit entry which shows a green `Enstry Successfully Submitted` drop down. The "Edit Entry Dialogue Card" then closes so that I can't re-submit accidentally the same entry.
6. When I navigate to `Search`, and chose the appropriate month prompt, I can see my own entry
7. I `Like` my own entry and see the icon go bold.
8. I `Share` my own entry, and successfully post the link to my `Facebook`.

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

## Story 4

**As an:** Register user, no role,

**I want to:** Make an anonymous comment, log in, and then reply with my account proper.

**So that:** I can put my opinion anonymously and openly.

**When I Do => I Get:**

1. Navigate directly to https://celebrity-fanalyzer.pages.dev/<prompt>
2. Swipe to the left x 2 to arrive at commenting.
3. Add a new comment anonymously and I expect to see the green "Success" banner and my comment show up.
4. Navigate to the `Profile` page, login successuly and be redirect to the profile page.
5. Navigate back to https://celebrity-fanalyzer.pages.dev/<prompt> and swipe left x 2.
6. Reply to the previous anonymous comment that I made and see it pop up as soon as I submit.
7. Click `Dislike` thumb on the anonymous comment that was mine before.
8. Edit my reply and see the change immediately.

## Story 5

**As an:** Register user, but not writer or editor,

**I want to:** I want to subscribe to an entry and a prompt and see the notifications.

**So that:** I can be notified when there are notifications. 

**When I Do => I Get:**

1. Navigate directly to a prompt https://celebrity-fanalyzer.pages.dev/<prompt> as a logged in user
2. I see a blue bell icon that allows me to toggle it on / off to receive or not receive notifications.
3. When I toggle it on, I see visual feedback that it is on and likewise when I toggle it off.
4. When someone else comments on the prompt, I receive a notification. 
5. Next I view an interesting entry. I see the same notificaiton button.
6. When I click the notification button, I see visual feedback that I have clicked it / unclicked it. 
7. When someone else comments on the entry, I see a notification appear in my notification inbox.
8. When I navigate to my subscriptions @ https://celebrity-fanalyzer.pages.dev/profile, I see all my notifications.
9. I can delete notifications that I have read and I see these notifications taken from the list. 
10. I can click the notifications to go to where the notification comes from. 
11. I can easily navigate back to the subscriptions page where I can see which notifications I have clicked and reviewed.



 
