# OpenGrid Contributing Guide

Open Grid follows the open source concept where as any new ideas and information is very helpful in advancing a project.  To contribute code to a project it must first be approved by project leader. Also there are licensing and agreements that needs to take effect.

## Submit a Pull Request
<p>Pull request is design to start a discussion about a probable changed to a project whether it's a bug fix or a new feature. Pull request allows users to convey changes that’s been added to a repository. It can only be initialized if there is a distinction between either the branches or repository.</p>
When creating a pull request submit any ideas or bugs to the Dev branch to be reviewed, discussed, elaborated, tested and possibly merged.
There are steps to have your pull request moved from the Dev branch to the Master branch. In order to have your idea approved for submission and merged into the Master branch.  It must pass integration testing. 
<p>The pull requester should:</p>
- Provide a reason for the new feature and/or bug fix.
- Add unit test to offer evidence for reasoning.
- Provide examples of functionality of the new feature or the bug fix.
- Convey any new dependencies introduced in the pull request.
- Reference any issues that are affiliated with pull request. 
- Test your theory before submittal; provide steps of implementation.
- Make sure to elaborate on how the submitted idea could be an asset to the project.  
- Make sure to provide a descriptive title. 
- Comment on the pull request this will improve the quality of the work.

<p>
The unit test will give the collaborators the ability to test and validate the purpose for the pull request.  Open Grid will perform a continuously integration test through a platform called Travis CI.  Travis CI will build and run pull request with results of either a pass or failed outcome this will also be a determining factor of getting your pull request merged into the master branch. </p>

##Create an Issue
<p>Issues consist of bug, enhancement or a feature submittal. In creating an issue, first check to make sure there isn’t a duplicate issue already documented. Provide screenshot/s of the issue. Create documentation of the issue. Make sure to document the browser specification, the operating system and script you are using. Provide efficient steps on how to reproduce the issue. Provide a detail description of what happened and what you expect to happen.</p>

### Bug Submittal - 
<p>Be specific and to the point in explaining the bug make sure to report the bug with a descriptive detail, programmers will most likely reject the bug if it cannot be replicated.Try reproducing the issue more than once for validation. Once replication is validated proceed to submitting an Issue.</p> 

- Describe the bug.
- Perform unit test and create a test script with step by step instructions explaining how to duplicate the bug; with an error message if displayed.
- Provide screenshots.
- Provide the Version, Operating System, Browser specification from which the bug was detected.
- What were the expected results?
- What were the actual results after the initial reproduction?

### Enhancement/Feature Request -
<p>If a new feature, explain the use case with suggestions or a specification.
- Who will be the target audience? 
- What would be the functionality of the new feature, offer illustrations? 
- Why is it needed? 
- How will it add significance to the project?</p>

### Assigning Labels to Issues or Pull Request -
<p>Labels are used within an issue or a pull request as a determining factor to establish priority and categorization to help organize a project.<br>There is a total of seven default labels within the github repository that one can use as a starter; if there are other creative labels that needs to be added there is an option to create or deleted labels within a repository.  Make sure each label matches your issue description subject wise.</p>
<p>Default Labels:</p>
- bug
- duplicate
- enhancement
- help wanted
- invalid
- question
- wontfix
 
OpenGrid has additional labels besides the default GitHub labels that corresponds to the project.

- <b>High Priority:</b><br>
Label thats considered a high priority. Issues have greater impact and needs to be addressed immediately. 

- <b>Medium Priority:</b><br>
Label that is considered a medium priority needs to be addressed after the high priority issue. This label could have minimal impact or could escalate to a high priority status. 

- <b>Low Priority:</b><br>
Labels that are considered a low priority; has no immediate impact based on urgency. A low priority label could be a new enhancement, question/s or an added feature.

- <b>Backlog Feature:</b><br>
Doesn’t have a significant impact on the project but will need to be addressed in the future.

## Ready to Commit
<p>When creating a commit make sure to write a descriptive and clean message. The subject line should be 50 chars or less, convey an imperative mood with capitalization at the beginning of the subject line and should not end with a period. The subsequent line should be blank. (Note: Any new paragraph should starts after a blank line.) The body of the message should be limited to 72 characters. Make sure to manually wrap the text as GitHub doesn’t wrap text automatically. A clear commit message should answer the questions of <b>WHAT</b>, <b>WHY</b> and <b>HOW</b>.</p> 
<b>Commit Message Syntax:</b><br>
Subject line (50 chars or less)<br><br>
The body of the message (limited to 72 characters) should atleast address the following questions below in some form or fashion.
- What was the problem?
- What was changed or added?  
- Why was it changed or added?
- How is it being handled?
<br>

Provide a source such as a url and/or a Bug Id for tracking and reference


## Milestones
<p>Milestones are used to track progress of issues and pull requests. 
They add significant value to project scheduling and monitoring. Milestones associate issues with specific features and help increase overall quality.</p>
Other factors about milestones:
- Milestones gives an overall visual of the lifespan of the project.
- Ability to set due dates to send notifications of approaching deadlines.
- Track percentage of task completion and provide breakdowns of open or closed issues.

<p>OpenGrid defines milestones as sprints each sprint has a combination of issues and pull request that are labeled by importance and given due dates to meet any assigned deadlines. Milestones can be viewed in the issues tab.</p>

# <font color="blue"> OpenGrid Quick Javascript Coding Guidline</font>
- Use jQuery’s proxy method if you want to maintain the “this” context on your event handler
- Use jQuery’s extend method to mix-in property values of 2 objects
- Prefix private methods with “_” (underscore) e.g. _myPrivateMethod
- Prefer multiple shorter methods than 1 long method. Makes code self-documenting
- Enclose method/function code in try-catch block when you are expecting something to go wrong within the block, unless expectation is set that the caller (one which calls this function) will need to handle generated exceptions (you want the exception to be bubbled up to the caller so it can deal with it accordingly i.e. clean up, conditionals, etc.) 
- Use K&R (Kerrigan & Ritchie ‘C’ language) convention when using begin/end curly brackets.
- When creating a new class, copy src/js/core/Empty.js into your own file, renaming appropriately. On your new class file, customize the template content with your specific class name, constructor parameters, description, etc.
- Use ogrid.Util static functions where applicable. Commonly used ones are isNull, guid and error.
- When creating a new class, copy and paste from core/Empty.js then customize class definition.
- Use ogrid.Alert static methods for any notification needs i.e. showing error/informational messages, busy message, system modal message box, etc.
- When applicable, use an _options private variable to pass user options to a class’s constructor (init method). This _options attribute can have default values, then mixed in using jQuery extend with the options passed to the constructor. 

#### <p><b>Other references</b></p>
- https://github.com/airbnb/javascript - Take note that some of the guidelines do not apply to ECMAScript 5.1 which we used for OpenGrid.

