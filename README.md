# Celebrity Fanalyzer

## Purpose

Celebrity Fanalyzer is the initial testing ground for an online news media platform called “Globe & Citizen.” The purpose of this pilot project is to expose unknown unknowns in the product development lifecycle, user experience, and software architecture. It is also to test functionality.

## Project Scope

Celebrity Fanalyzer is intended to be a project of very limited scope. It is to host entries to a competitions run via the Freelancer web platform. It is to be a simple web application with the primary functionality being limited to CRUD operations and the representation of user reactions through rich graphical renderings. Any financial integration is to be avoided as is the gathering of personal information.
Prior to being recast as Globe&Citizen, the company will complete work on an anonymizing HTTP reverse proxy called, "Layer8." This anonymizing reverse proxy will have the sole purpose of removing from user requests all identifying information. This will allow Globe&Citizen to reflect usage statistics publicly without any possibility of leaking personal information -- this is absolutely fundamental to success.

## Users

- Competition entrants: Seeking to earn rewards, competitors will submit entries that are voted on / reacted to.

- Viewers / Voters: Invited by competition entrants, these users can be expected to simply vote / react to content.

- Readers: As the content library grows, in parallel to content quality, general readers can be expected based on organic internet searches.

## Basic Architecture

Celebrity Fanalyzer is a PWA built on the Quasar Framework and backed by Google Firebase.

## Example User Stories:

- Author / Contributor: A user, either through Freelancer, or independently as a first time contributor, decides that a topic of interest for next month’s competition is something they know much about and take interest in. This user creates an account with very simple login credentials and posts their opinion of a particular subject. In order to advance their own opinion, they cite facts from the shared topic Wiki. After submitting their final opinion, they solicit votes (most often by direct personal request via social media). If they receive the most votes (or comments, or likes, etc.), they receive direct financial reward.
- User / Reader: Either from organic internet search, or from direct personal invitation to vote, a user reads about a particular topic. In the future, knowing the ease with which metadata about a subject is available via Celebrity Fanalyzer (eventually to be Globe and Citizen), they return to learn more.

<!-- https://celebrityfanalyzer.com/wp-admin/ -->

![Mock](/public/mock.png)
