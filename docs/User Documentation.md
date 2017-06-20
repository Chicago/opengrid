<H1 align="center"><B>OpenGrid</B></H1>
<H4 align="center">Version 1.3.0</H4>
<p align="center"><img src="https://github.com/Chicago/opengrid/blob/master/docs/media/image1.jpg"> </p>
<p align="center"><b>Department of Innovation & Technology</b></p>

### Table of Contents
* [Getting Started](#getting-started)
    * [Background and Overview](#background-and-overview)
* [Acknowledgements](#acknowledgements)
* [User Documentation](#user-documentation)
    * [Supported Browsers](#supported-browsers)
    * [Login/Logout](#loginlogout)
    * [The Landing Page](#the-landing-page)
    * [Session Timeout](#session-timeout)
* [Base Map](#base-map)
    * [Map Layers](#map-layers)
    * [Map Legend](#map-legend)
    * [Map Navigation](#map-navigation)
    * [Measurement Tool](#measurement-tool)
* [Types of Searches](#types-of-searches)
    * [Quick Search](#quick-search)
    * [Find Data Panel](#find-data-panel)
    * [Advanced Search](#advanced-search)
* [Existing Queries](#existing-queries)
   * [Commonly Used Queries](#commonly-used-queries)
* [Data Formation](#data-formation)
   * [Map Grid](#map-grid)
   * [Table Grid](#table-grid)
   * [Components of the Table Grid](#components-of-the-table-grid)
* [Saving Searches](#saving-searches)
* [Administrator](#administrator)
   * [Manage Users and Manage Groups](#manage-users-and-manage-groups)
<br>
<br>

## Getting Started
### Background and Overview
<p>Open Grid is a geographical information systems developed for residents to access public city data in a more intuitive manner. The application supports situational awareness, incident responses and monitoring, historical data retrieval, and real-time advanced analytics.</p>

<p>OpenGrid design has a three-layer service architecture: Presentation, Business and Data. The presentation layer provides the application’s user interface which is a static HTML/JavaScript based GUI that presents a more intuitive and modernized approach that support usage and accessibility on any mobile device and terminals in public safety vehicles.</p>

<p>Business layer which is the service layer implements the business aspects and functionality of the application. Such as defining business rules, design, deployment, maintenance and management of the application which is adaptable based off client specification. </p>

<p> The data layer is where information is stored from databases. OpenGrid utilizes MongoDB, a NoSQL open source document database optimized to handle spatial data. Mongo provides high performance, high availability and automatic scaling. The application interacts with different database engines or APIs which makes it easy for other cities: governments, non-profits and/or corporations to adopt the application.</p>

<p>OpenGrid offers configurable methods where administrators can define user roles, system authenticators or remove security features, where verification is no longer a requirement for application accessibility. Administrators can apply certain functions and data-set/s to a specific security group/s and/or users, if relevant.
</p>

## Acknowledgements
OpenGrid was developed with the support of Bloomberg Philanthropies. 

## User Documentation
<p>User documentation is designed to assist end users with the use of OpenGrid product and services. Upon usage of documentation the user will gain appropriate knowledge and capabilities to navigate the system. The user will inherit an understanding of the system and its processes and have the foundation to execute queries for navigation.</p>
 
#### Supported Browsers
<p>OpenGrid supports both mobile and desktop versions search engines. Mobile Android devices support Firefox version 40&#43; and Chrome 44&#43;. Ios devices support Chrome 45&#43;, Safari 8.1&#43; and Firefox 40&#43;. Desktop versions support Firefox 42&#43; and Chrome 46&#43;; Internet Explorer is supported from IE10&#43; no older versions will be continued. All browsers must have cookies enabled and support JavaScript/ECMAScript version 5.1.</p>


### Login/Logout
<p>
When the application is initially opened through a browser the login screen will appear (If authentication feature is activated). Prompting a cursor within the username textbox; the login button is initially disabled until both username and password has been entered. Once the user information has been provided and the login button has been selected, the user credentials will become validated against the system.
</p>

<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec12.jpg"></div>
<p align="center"><b>Figure 1. OpenGrid Login Screen</b></p>

<br>
<p>
If login failed, an error message will appear: <b>“Login failed due to invalid username or password.”</b> The system will allow the user to re-enter a valid username and/or password.
</p>

<br>

<p>
<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec13.jpg"></div><br>
<p align="center"><b>Figure 2. Login Error Message</b></p>
</p>

<br>
<br>
If login was successful, the landing page will launch.

<p>
<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec03.jpg"></div><br>
<p align="center"><b>Figure 3. Landing Page</b></p>
</p>

### The Landing Page
> The Landing page image shown above in Figure 3.

<table>
<tr>
<th>Element No.</th>
<th>Element Name/Description</th>
</tr>

<tr>
<td>
<ol>
<li> 
</td>	
<td>
<p>Quick Search box is used to perform basic searches on datasets. The question mark icon within the Quick Search box displays a cheat sheet for quick search syntax.</p>
</td>
</ol>
</tr>

<tr>
<td>
<ol start="2">
<li>
</td>
<td>
<p>
<ul>
<li>Find Data Button displays the advanced search panel utilize to create more defined searches.</li> <br>
<li>Clear Data Button clears any search options with the panel, textbox and the map grid.</li> <br>
<li>Manage Button displays the list of groups and user’s data (this feature is only available for admin users)</li>
</ul>
</p>
</td>
</ol>
</tr>

<tr>
<td>
<ol start="3">
<li>
</td>
<td>
<p>User Credentials – Displays the name of the currently logged in user also provides the logout functionality, which is located within the drop-down menu to the right of the username.</p>
</td>
</ol>
</tr>

<tr>
<td>
<ol start="4">
<li>
</td>
<td>
User Manual Icon – Link to accessing the user manual 
</td>
</ol>
</tr>

<tr>
<td>
<ol start="5">
<li>
</td>
<td>
Zoom In and Zoom Out Icon <img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/image34.jpg">
</td>
</ol>
</tr>

<tr>
<td>
<ol start="6">
<li>
</td>
<td>
Reset Map View and Area Zoom Icon <img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/rest.jpg">
</td>
</ol>
</tr>

<tr>
<td>
<ol start="7">
<li>
</td>	
<td>
Zoom specification Icon <img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/image37.jpg"> <br> Full-Screen Icon <img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/image38.jpg"> <br>Geo-location Icon <img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/image36.jpg">
</td>
</ol>
</tr>

<tr>
<td>
<ol start="8">
<li>
</td>
<td>
<p>Measurement Tool</p>
</td>
</ol>
</tr>

<tr>
<td>
<ol start="9">
<li>
</td>
<td>
<p>
Layers Icon <img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/image39.jpg"> <br> Consist of list of grid views and weather layers.
</p>

<p>
<b>Grid Views:</b>
<u1> <ul> <ul>
<li>Street View (Default) </li>
<li>Aerial View </li>
<li>Black and White View </li>
</ul></ul></ul>
</p>
<p>
<b>Open Weather Layers:</b>
<u1> <ul> <ul>
<li>Cloud Cover </li>
<li>Quantity of Precipitation </li>
<li>Sea Level Pressure </li> 
<li>Temperature </li>
</ul></ul></ul>
</p>
</td>
</ol>
</tr>

<tr>
<td>
<ol start="10">
<li>
</td>
<td>
<p> Expandable Table view panel</p>
</td>
</ol>
</tr>

<tr>
<td>
<ol start="11">
<li>
</td>
<td>
<p>Map attribution; this will display a link for any copyright information, terms of use, etc.</p>
</td>
</ol>
</tr>

<tr>
<td>
<ol start="12">
<li>
</td>
<td>
<p>Main Map display</p>
</td>
</ol>
</tr>
</table>

<br>

<h3>Session Timeout</h3>

<p>
Once the landing page has been displayed if there's been no server activity on the application after four hours the user will be logged out automatically with a message appearing.  See Figure 4 below:
</p>

<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec01.jpg"> </div>
<p align="center"><b>Figure 4. Message when Session Times Out</b></p>


<h2> Base Map</h2>
<h3> Map Layers</h3>
<p>
The layers icon displays multiple basemap views and open weather layers. The list is built dynamically based on what's available through the Map Service provider. In the lower right hand corner on the grid, there is information and active links provided about the map services.  The initial launch page displays the default basemap, Street View. For all other basemaps see Figure 5a and 5b below.
</p>
<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec15.jpg"> 
</div>
<p align="center"><b>Figure 5a. Aerial View</b></p>


<br>
<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec17.jpg"> 
</div>
<p align="center"><b>Figure 5b. Black and White View</b></p>

<h4>Map Legend</h4>
<p>
A dynamic legend will display a representation of what type of search was executed. If, multiple types with same dataset is being displayed for a search; it will display the two datatypes based off color representation from the setup on the grid. 
</p>

<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec20.jpg"> 
</div>
<p align="center"><b>Figure 6. Map Legend</b></p>
<br>

#### Map Navigation
<p>Navigation tools are used to aid users in finding their way around a map. Using navigational controls, the user should be able to:</p>

* zoom in/out
* reset the map
* pan to any direction
* switch to full screen mode
* activate geo-location
* apply layers
* apply measurements
* select hyperlinks

<br>

#### Measurement Tool
<p>
By selecting the measurement icon, the measurement tool can be turned on to enable measurements of the following:
</p>

<p>Linear Measurement</p>

* Distance between points

<p>Area Measurement</p>

* Distance around a point

<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec23.jpg">
</div>
<p align="center"><b>Figure 7a. Linear Measurement</b></p>

<br>

<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec21.jpg">
</div>
<p align="center"><b>Figure 7b. Multiple Linear Measurement </b></p>
<br><br>
<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec26.jpg">
</div>
<p align="center"><b>Figure 7c. Area Measurement</b></p>

<br>
<br>

<h2>Types of Searches</h2>
<h3>Quick Search</h3>
A Quick Search box can be used to perform common searches that will support the following commands/inputs:

<table>
    <col style="width:15%">
    <col style="width:30%">
    <col style="width:5%">
    <col style="width:5%">
    <col style="width:45%">
    <thead>
   <tr>
        <th>Query Type</th>
        <th>Description</th>
        <th>Command Syntax</th>
	<th>Sample</th>
	<th>Display Columns on Search Result</th>
    </tr>
    <tr>
        <td width="10%">Address</td> <TD width="30%">Finds the specified address using the Map/GIS Service.</TD>	<TD>&lt;number&gt;&lt;direction&gt;&lt;streetname&gt;</TD> <TD>50 W. Washington</TD> <TD>Displayed as a marker on the map</TD>     
    </tr>

   <tr>
        <td>Latitude and Longitude</td>	<TD>Displays a marker to show location of latitude and longitude entered.</TD> <TD>&lt;latitude&gt;, &lt;longitude&gt;</TD> <TD>41.8270, -87.6423</TD> <TD>Displayed as a marker on the map</TD>   
    </tr>
	
  <tr>
        <td>Place Name</td> <TD>Shows location of the place specified.</TD> <TD>&lt;name of place&gt;</TD> <TD>Daley Center</TD> <TD>Displayed as a marker on the map</TD>
    </tr>
	<tr>
        <td>Tweets</td> <TD>Displays recent tweets matching keyword, if provided. Keyword can be a bareword or a double-quoted set of words.</TD> <TD>tweet &lt;keyword&gt;</TD> <TD>tweet</TD> <TD><ul><li>Date</li> <li>Screen Name</li> <li>Text</li> <li>City</li></ul></TD>
    </tr>
	
  <tr>
        <td>Weather</td> <TD>Displays a point in the middle of the map showing weather information for the zip code.</TD> <TD>weather &lt;zip code&gt;</TD> <TD>weather 60601</TD> <TD><ul><li>Temperature in (Fahrenheit)</li>  <li>Wind</li> <li>Conditions</li> <li>Humidity</li> <li>Forecast</li></ul></TD>
    </tr>
    </table>

<br>
<p>
The data results for the above search types and any other search form will appear as point/s, custom icons or markers on the map. Any search type information, whether its performed as a Quick Search or Advanced Search will display on the map and table grid. The table grid displays data as rows.
</p>

<p>
In some cases, there will only be one row of data on the grid (for example, Weather or Bus ID search). Quick search results can be cleared/reset by clicking on the Clear Data button. This action will also stop all data auto-refresh activities, if any are happening in the background.
</p>

<p>
Tweet dataset provides real-time data and automatically refreshes with new data every 30 seconds within set intervals. The data points have active links embedded, when selected the link will open in a new browser window displaying social media content, such as articles, photos and location associated with the tweet.
</p>

<br>

<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec25.jpg"> 
</div>
<p align="center"><b>Figure 8. Quick Search on Tweets</b></p>

<br>
<h3> Find Data Panel </h3> 

<b><i>Note: Manage Queries, Load Saved Query and Save Query As seen in the image below are configurations that can be enabled and disabled within the application. These attributes does not appear in opengrid.io.</i></b>

<h4>Advanced Search</h4>

<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec18.jpg"> 
</div>
<p align="center"><b>Figure 9. Find Data Panel</b></p>

<br>
The Find Data Panel is where more defined searches are built, saved and existing searches are executed.
<table>
<tr>
<th>Section No.</th>
<th>Description</th>
</tr>

<tr>
<td>
<ol>
<li> 
</td>	
<td>
<p>Search Link - Displays the Advanced Search Panel</p>
</ol>
</td>
</tr>

<tr>
<td>
<ol start="2">
<li>
</td>
<td>
<p>Manage Queries Link - Stores saved searches </p>
</ol>
</td>
</tr>

<tr>
<td>
<ol start="3">
<li>
</td>
<td>
<p> Existing Queries
<ul><ul><ul>
<li>COMMONLY USED QUERIES </li>
<li>LOAD SAVED QUERIES</li>
</ul></ul></ul>
</p>
</ol>
</td>
</tr>

<tr>
<td>
<ol start="4">
<li>
</td>
<td>
<p>Select Data</p>
<ul><ul><ul>
<li>Add dataset</li>
</ul></ul></ul>
</ol>
</td>
</tr>

<tr>
<td>
<ol start="5">
<li>
</td>
<td>
Select Location
<ul><ul><ul>
<li>WITHIN (SELECT BOUNDARY)</li>
<li>NEAR (SELECT POINT)</li>
</ul></ul></ul>
</ol>
</td>
</tr>

<tr>
<td>
<ol start="6">
<li>
</td>
<td>
Save Query As
</td>
</tr>

<tr>
<td>
<ol start="7">
<li>
</td>
<td>
Auto-Refresh Every (SECONDS)
</td>
</ol>
</tr>

<tr>
<td>
<ol start="8">
<li>
</td>
<td>
Get Data - Executes the search
</td>
</ol>
</tr>

<tr>
<td>
<ol start="9">
<li>
</td>
<td>
<p>Clear Search - Resets the Find Data Panel</p>
</td>
</ol>
</tr>
</table>

<br>
<p>
The Find Data Panel is also called the advanced search, it is used to narrow searches by applying a series of different filters and actions. The user has the ability to enter a combination of search criteria by applying one or more datasets, adding rule/s or group/s for building a search. The panel has map extent setup as default when performing a search; when a search is executed all data will plot within the area of the current map location boundary.
</p>

<p>
All datasets have a default color in case multiple datasets are applied on the map, it helps differentiate between the data. The user also has the ability to modify color, size and opacity of each data point pertaining to a dataset.
</p>

<p>
Using food establishments as an example, a user can search for restaurants and food trucks in Chicago, the two criteria is listed under a single dataset, called Business Licenses. A user may want to run multiple Business Licenses criteria in a single search for comparison purposes. What should a user do since there is a one color limitation and default color per dataset setup?
</p>

<p>
Simple, just add Business Licenses dataset twice, then set one with a filter  <b>License_description = “Retail Food Establishment” </b> and the other <b>License_description = “Mobile Food License”</b>, and assign each dataset a different color by selecting the “Color Option” tool beneath each dataset setup.
</p>

<p>
In the example below, it shows how the search was applied and how each data type is represented on the grid... Retail Food Establishments has the default color of Blue and Mobile Food Licenses is Red.
</p>
<br>
<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec16.jpg"> 
</div>
<p align="center"><b>Figure 10. Business Licenses Dataset Example </b></p>
<br>
<p>
To further filter a search, a geo-spatial filter can be applied by drawing a shape on a targeted area on a map or selecting one of the pre-defined boundaries from the Select Location section of the panel. Select Location has two geo-spatial options called <b>WITHIN</b> and <b>NEAR</b> (see images below).
</p>

<div align="left"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec09.jpg"> 
</div>
<p align="left"><b>Figure 11a. WITHIN Boundary</b></p>
<br>
<div align="left"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec10.jpg"> 
</div>
<p align="left"><b>Figure 11b. NEAR Me</b></p>
<br>
<div align="left"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec11.jpg"> 
</div>
<p align="left"><b>Figure 11c. NEAR Marker</b></p>
<p>
Amongst applying boundaries to a search, auto refresh component can be setup for a search by the number of intervals in seconds (minimum of 30 seconds, maximum of 3600 seconds or 60 minutes).
</p>

<p>
When a query is submitted, the application will display a message when the query times out. It will also display a message when the search service returns no data.
</p>
<br>
<h3>Existing Queries</h3>
<h4> Commonly Used Queries</h4>
<p>
Are popular searches that city residents are most likely to explore within the application. The drop menu has a list of predefined queries that a user can apply as a search. 
</p>

<p>
Each query when selected displays its search parameters under the Select Data section. To run commonly used queries, select a search from the drop list and select Get Data.
</p>
<br>
<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec27.jpg"> 
</div>
<p align="center"><b>Figure 12. Commonly Used Queries</b></p>
<br>

<h2> Data Formation</h2>
<h3> Map Grid </h3>
<p>
The map grid is interactive, a user can navigate the map using a mouse, keyboard and for mobile devices by swiping using index finger.  The map displays the maximum of 1000 points. All data appears on the grid as points and/or markers. Places/Address search plot as markers and Datasets plot as points on the grid. The map legend appears on the grid when a search has been executed, displaying the color of the data point and the name of the data being displayed. A retractable information box appears to the bottom right of the grid when a search is performed, displaying the No. of records found or an error message pertaining to a search. The grid has an automatic refresh feature for updating and re-plotting data upon navigating around the map.
</p>

<br>

<h3>Table Grid</h3>
<p>
The table grid is located at the bottom of the map. The table becomes active when a search has been performed and returns a set of results on the map. To access the table after a search, click on the black bar at the bottom of the map, there is a white carat displayed in the middle of the black bar below as an indicator that the bar is collapsible. After clicking on the bar, the table will expand upward exposing the table and its components.
</p>
<br>
<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec29.jpg"> 
</div>
<p align="center"><b>Figure 13. Table Grid</b></p>
<br>
<h3> Components of the Table Grid </h3>
<b>Information Tab</b>

- Search type (i.e. Place/Address, Business License).

<b>Search Textbox</b>

- Used to filter by data components within the table.

<b>Columns Icon</b>

- Provides a drop list of available columns pertaining to the data within the datasets. The columns are interchangeable, user can enable and disable certain columns from the table by selecting or deselecting each column name from the column list.

<b>Export Icon</b>

- Provides a drop-list of available exportation options used to send or transfer data from the table into the following formats:
<ul><ul><ul><ul><ul><ul><ul>
<li>CSV - Comma Separated Values</li>
<li>PDF - Portable Document Format</li>
<li>MS Excel - Microsoft Excel</li>
</ul></ul></ul></ul></ul></ul></ul>

<b>Graph</b>

- Places the search results into a pie chart it is group by certain parameters from the search depending on the dataset.

<b>Heat Map</b>

- Data that’s contained in a matrix within a representation of colors to use for analysis, comparison or trending purposes.

<b>Tile Map</b>

- Small images, usually rectangular or isometric layers that acts as puzzle pieces to cover an intended area.

<b>Rows Droplist</b>

* Provides a drop list of total number of rows that can be displayed per page.

<b>Page Numbers</b>

* Interactive number links for maneuvering through pages.

<br>

<h2>Saving Searches</h2>
<p>
OpenGrid allows a user to create searches; there is also an option to save a search.  To save a query, define a name for your search within the <b>“Save Query As”</b> section of the Find Data Panel.  A successful save will return a message in the lower right corner, “Query was successfully saved".  
</p>

<p>
A search is saved and stored in the <b>Manage Queries</b> panel. Saved searches are also accessible within the <b>Load Save Queries</b> drop list located in the <b>Existing Queries</b> section of the Find Data Panel.  Load Save Queries section stores the ten most recent saved searches. 
</p>

<p>
A saved search can also be overwritten upon user discretion. To overwrite a search, simply access the save search in the list and within the <b>“Save Query As”</b> textbox remove the saved search name and redefine it. Select the Save button to execute the new save. A warning message  within a decision textbox will appear  alarming the user that the name already exist, would you like to continue with the overwrite and as a result it will overwrite the existing query with that name. 
</p>

<br>

<div align="center"><img src="https://github.com/Chicago/opengrid/blob/dev/docs/media/dec14.jpg"> 
</div>
<p align="center"><b>Figure 14. Query Overwrite</b></p>
<br>

<h2>Administrator</h2>
<h4>Manage Users and Manage Groups</h4>
<p>The admin screen is accessible by selecting the Manage Button.  Administrator capabilities are available for admin users only.  Manage Users and Manage Groups are active links; when selected their panel is exposed. Admin users can perform the following tasks:
</p>

- Add/ Remove users
- Update Users
- Delete Users
- Add/Remove roles from users
- Add a Group
- Add/Remove Group

<p>
To setup a group under the Manage Group link, select the green new group.  The administrator will need to provide a Group ID, the group ID when initially created and saved will no longer be editable; name of the group and a description for the group, in which both are editable. There are two check boxes <b> “Is Admin Group” </b> which is an optional configuration that signifies the group is for admin use only; <b> “Enabled” </b>, activates the new group for usage. To save the new group, select the Submit button, this action will cause the group to be saved and stored within the manage groups panel list. Once a new group has been created the administrator can begin assigning the group to users.
</p>

<p>
Manage Group Panel provides information about the different types of groups created within the application and its components.
</p>

* Edit Functions (update and delete icons)
* New Group Button
* Group Details
* Functions
* Data Types

<p>
The group details column provides the name and the description of the group. The Functions columns provides a drop list of available options that are applied to a group. The administrator will have access to all options and users only has access to the advanced search option.
</p>


<p>
The manage users link displays a list of all available users and components. 
</p>

* Edits functions (update and delete icons)
* New User Button
* User ID
* User First Name
* User Last Name
* Group options the users have access to

<p>
The new user button performs two functionalities, finding a User and Adding a User. To find a user, select <b>“Find By User ID”</b> or <b>“Find By Name”</b>.  “Find By Name” search provides multiple search options to find existing or future user/s by first name, last name, or combination of both. To look-up a user select the Find button, this action will search for a user profile.
</p>

<p>
To add a new user, search for the user by name or userid. When the appropriate user is found click on the submit button. This action will add the user to the application.
</p>

<p>
To verify, if user was successfully added navigate to the Manage Users panel, scroll down the list until the username is found.
</p>

<a href="#top">Back to Top</a>
