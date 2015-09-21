# OpenGrid Contributing Guide

Open Grid follows the open source concept where as any new ideas and information is very helpful in advancing a project.  To contribute code to a project it must first be approved by project leader. Also there are licensing and agreements that needs to take effect.


## Fork and Clone
The next step would be to create a fork within the original project and clone to your computer. A fork produces a copy of the original project this copy will allow you to easily modify changes without affecting the origin project. 

###Fork a repository:
- Click on the Fork Button in the header of the repository. After its finish, you’ll be taken to a copy of the repository that was created.
- To be able to work on the project and experiment with changes you will need to clone the fork repo to your computer.

### Clone the fork repo:
- If using the GitHub desktop application simply click on the button called **“Clone in Desktop”**. 
- Save the clone repository to a relevant location on your computer.

<div align="center"><b> Example: git clone https://github.com/YOUR-USERNAME/cloned repository</div></b>

## Submit a Pull Request
<p>Pull request allows users to convey changes that’s been added to a repository.  Pull request can only be initialized if there is a distinction between either the branches or repository.  To collaborate new changes or submit ideas:</p>
- Always specify what branch you’ll like to merge your changes into. 
- Test your theory before submittal; provide steps of implementation and documentation.  
- Submission of a detail description is required.  

<p>Once a pull request is created other users can review the changes or provide feedback.</p>

##Create an Issue
<p>Issues consist of bug, enhancement or a feature submittal. In creating an issue, first check to make sure there isn’t a duplicate issue already documented. Provide screenshot/s of the issue. Create documentation of the issue. Make sure to document the browser specification, the operating system and script you are using. Provide efficient steps on how to reproduce the issue. Provide a detail description of what happened and what you expect to happen.</p>

### Bug Submittal- 
<p>Be specific and to the point in explaining the bug make sure to report the bug with a descriptive detail, programmers will most likely reject the bug if it cannot be replicated.Try reproducing the issue more than once for validation. Once replication is validated proceed to submitting an Issue.</p> 

- Describe the bug.
- Perform unit test and create a test script with step by step instructions explaining how to duplicate the bug; with an error message if displayed.
- Provide screenshots.
- Provide the Version, Operating System, Browser specification from which the bug was detected.
- What were the expected results?
- What were the actual results after the initial reproduction?

### Enhancement/Feature Request -
<p>If a new feature, explain the use case with suggestions or a specification.
Who will be the target audience? What would be the functionality of the new feature, offer illustrations? Why is it needed? How will it add significance to our work?</p>

##Ready to Commit
<p>When contributing to a project make sure to write a descriptive and clean commit message; a clear commit message should answer the questions of <b>WHAT</b>, <b>WHY</b> and <b>HOW</b>.<p> 
<p>Examples:</p>
- What was the problem
- What was changed or added  
- Why was it changed or added
- How is it being handled

<p>The first line should be the subject (50 chars or less) with capitalization at the beginning of the subject line. The style must be imperative and should not end with a period. The second line should be blank. (Note: any new paragraph starts after a blank line.) The body of the message should be limited to 72 characters.  Make sure to manually wrap text as Git doesn’t wrap text automatically.</p>   


##Milestones
<p>Milestones are used to track progress of issues and pull requests. 
They add significant value to project scheduling and monitoring. Milestones associate issues with specific features.</p>

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

