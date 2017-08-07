# OpenGrid Contributing Guide

We think open source is great because we can work with you to add new features and fix bugs in the system. There are a number of ways you can contribute to the project, such as:

  * Add or clarify the language in the documentation (e.g., `README.md`, `docs/` folder)
  * Fix a bug listed on the [issue tracker](../../../issues/)
  * **Write a unit test**
  * Add a new feature that is discussed on the [developer documentation](../../../wiki)

If you're interested in contributing to the project, below are the guidelines for developers.

## Creating a pull request

Below are the guidelines on submitting code to this project and some of the criteria we will use before accepting a pull request:

  - **Discuss major changes with development team** If you hope to add a new feature or make a significant change, please discuss it with the development team on the [issue tracker](../../../issues/) or [forum](https://groups.google.com/forum/#!forum/opengrid-chicago). If you start working on a new feature, please open a new issue that describes the work you will complete. This will help avoiding duplicating work, creating technical conflicts, and help your work to be included in the project.
  - **Sign a contributor license agreement** Before we accept any pull request, you must sign a contributor license agreement (CLA). If you'd like to discuss the CLA language, please visit its [repository](https://github.com/Chicago/contributor-license-agreement).
  - **Write unit tests for new functions** New features or functions should be accompanied by unit tests that must work on Travis CI (Ubuntu) and AppVeyor (Windows).
  - **Ensure code conforms to the project coding standards** 
  - **Update or add new documentation** Likewise, these changes should also have documentation to reflect that. Please update the documentation found in the `docs/` folder.

The development team will review pull requests, looking at the following criteria:

  * Does the pull request fit within the goal of the project and fit in the roadmap?
  * Does it pass all new and existing unit tests (e.g., TravisCI and AppVeyor)?
  * Is the code coverage similar or higher than before (e.g., Coveralls.io)?
  * Have the changes been documented in the [documentation](docs/)?
  * Does the code introduce any security vulernability?
  * Was the CLA signed by the contributor?

### Submitting a pull request

When you are ready to submit a pull request, please following these instructions:
  
  * Use the current `dev` branch as the code base for any improvements

  	```bash
  	git checkout dev
  	```
  * Incorporate your changes into the code. Remember to follow the coding guidelines, add new unit tests, and documentation
  * Create logical commits that describe the work that was completed. [Reference issues](https://help.github.com/articles/closing-issues-via-commit-messages/) in the commit messages as appropriate.
  * Build your changes locally to ensure all tests pass:

  	```bash
  	gulp test
  	```
  * Push your branch to GitHub

  	```bash
  	git push origin my-fix-branch
  	```

  * Sign the [Contributor License Agreement](https://www.clahub.com/agreements/Chicago/opengrid). If you have any questions or issues, please visit the [license agreement's repository](https://github.com/Chicago/contributor-license-agreement).
  * In GitHub, send a pull request to `opengrid:dev`. Please add a descriptive title and description of the changes. Please reference issues or prior conversations, if applicable.
  * Interact with the development team as questions and conversation arises.

#### <p><b>Other references</b></p>
- https://github.com/airbnb/javascript - Take note that some of the guidelines do not apply to ECMAScript 5.1 which we used for OpenGrid.

