---
layout: post
title:  Case Study - The Pivot
date:   2026-07-16 12:00:00
description: what happens when you're forced to pivot?
tags:  
categories: case-study
---

## One-Line Summary 

One of the realities of being an engineer in an agile environment is that you will be forced to pivot, whether you like it or not. This is a review of two different times I was forced to make a rather large pivot on two different projects. Both were successful yet had different long-term outcomes.


## Context

The first project (Project Alpha) was a large-scale migration. A legacy Perl-based platform that had been accumulating tech debt for over a decade was being forcibly decommissioned for security reasons (really old Perl code). I was taking on the entire migration to use as experience and as evidence for a promotion. This migration had a hard deadline, as the platform would be shut off, ignoring all other dependencies. You either migrate or your service breaks.

The second project (The Beta Initiative) was a task scoped across multiple stages that our team was beginning to flesh out. It had a fairly lenient schedule. Our team was treating it as a research task and were excited to shift into actually implementing the new concepts.


## Two Different Beginnings

I was excited for Project Alpha. It was a chance to prove to myself and to the company that I was capable of more than my current job position, and that I could take a large-scale project from nothing to launched independently.

The first task was to document the code paths actively used by services owned by my team and separate out the dead code. I ended up processing ~4k lines of code across 6 packages to identify the 5 core APIs and isolated the ~700 lines our team actually needed. I created charts to easily show the relationships between single components in the legacy service and their dependencies. I also created a potential integration chart for the new service and how it would fit into new external dependencies and other services actively being migrated off the same platform. This documented how single components could be built in parallel to ensure the migration could be completed within the timeline. APIs were split into new components, shared logic was colocated, views were separated for ease of use, and interconnected flows were mapped for clarity.

With this initial planning and organization, I felt like I was in a good place to begin implementation.

The Beta Initiative was a little different. This was something that had been on the roadmap for some time but was months off from a required release. We had a vague idea where we were headed based on work done previously, but we were still in the design phase. There were some older designs from semi-related projects we wanted to use, a couple of research tasks had been started to better understand implementation hurdles further down the line, and we were about ready to reconvene to fully plan out the next couple of sprints.

## The Pivot

Project Alpha was going well. I had just started implementation on the first component and was excited to start showing progress. Surprise! The project was being moved off my plate, an entirely new team was being spun up, and the project itself was moving halfway across the globe. This task could no longer be the capstone for my current attempt at a promotion, and would now be owned by an entirely new set of people. Timeline had not changed, but my responsibility was being offloaded.

Of course, this wasn't the outcome I would have hoped for, but that's business, and I had a job to do. I shifted my focus away from the project being a development task to treating it as an architecture task. I knew the path I wanted to take the project; I now just needed to help the team understand the vision and help them succeed.

I took the documentation I originally created and expanded it to cover more detail and enable scaled implementation. I explained the purpose of each component and outlined what the logic flow should look like. I organized the required components to show which needed to be implemented first, listed a potential timeline for each, and highlighted features that required external interfacing. I worked to align the team with both upstream and downstream dependencies so there would be a seamless handover once the old system was taken offline. I had shifted from a lead developer to a project coordinator role while the team was spun up.

The Beta Initiative was a little more tumultuous. The task became a high-priority project with an accelerated timeline. The team needed to split focus and simultaneously complete research on integration with new components, start development on core features, and design UI elements without clearly defined requirements.

The majority of my time was on the integration side, trying to define exactly what the team needed to complete to show the feature was a success. At the same time, I still needed to help the design team understand the task so they could define user flows, while also unblocking other developers actively working on updating existing components. This chaotic development cycle created a revolving door of roadblocks and issues, exacerbated by the immovable deadline. A research task would finish, unblocking implementation efforts, but design would come back with new concepts based on new requirements from product owners, meaning more research needed to be completed during implementation, while other components would need to be rewritten to work with adjusted concepts, but limitations of the platform meant certain requirements needed to be reevaluated and tradeoffs approved by product owners, and so on. The team was running head-first down a hill, but there was no stopping and no real room for failure.


## End Result

Project Alpha was a success. The team onboarded, ramped up, I walked them through initial development, they got on a plane, and that was that. They eventually finished implementation before the deadline to turn off the legacy service, and scaled the new implementation without issue.

The Beta Initiative, while also a success, was more painful. The team was able to complete development on the feature and deploy the final result. The project functioned as intended, but the way it was handled created more follow-on work after launch.


## Looking Back

These were two examples of projects that were forced to pivot, but their level of success differed because of preparedness, clarity, and timeline. I had the opportunity to fully flesh out requirements and roadmap Project Alpha before any implementation was started. The Beta Initiative was not so lucky. We were forced to implement without a solid plan, causing development issues for the team. Direction was not clear, since requirements were actively being adjusted while the team was still moving forward. Both projects ended with a successful result, but The Beta Initiative will have more long-term tech debt and require more documentation, simply based on shifting priorities.

- **Plan Before Implementing** - try to flesh out as much detail as possible before implementing a solution. Think about what roadblocks the team could hit, what things they need to be successful, and what additional resources to tap when they hit an unknown situation.

- **Fight for Tradeoffs** - if time is a factor, it's easier to reduce the number of initial release features and then continue with fast-follow releases to meet the initial ask than it is to cram all the features into the initial release at the sacrifice of product maintainability and developer sanity.

- **Ask for Help** - sometimes a developer will get stuck in a rut, trying to solve some issue. Reaching out to other developers can help resolve blockers. Even just voicing your issue to another person related to the project can be helpful, even if they can't directly solve the problem.