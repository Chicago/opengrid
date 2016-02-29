<br>
<h1 align="center">OpenGrid REST Service <br> Application Programming Interface (API)</h1>
<h4 align="center">Version 1.0</h4>

<!--
## Table of Contents
//-->

<!--
[REST Service Resources](#rest-service-resources)
//-->

<!--
[users/token](#userstoken)
//-->

<!--
[users/renew](#usersrenew)
//-->

<!--
[users](#users)
//-->

<!--
[users/user_id](#usersuser_id)
//-->

<!--
[groups](#groups)
//-->

<!--
[groups/group_id](#groupsgroup_id)
//-->

<!--
[datasets](#datasets)
//-->

<!--
[datasets/dataset_id](#datasetsdataset_id)
//-->

<!--
[datasets/dataset_id/query](#datasetsdataset_idquery)
//-->

<!--
[queries](#queries)
//-->

<!--
[queries/query_id](#queriesquery_id)
//-->

<!--
[HTTP Status Codes on Responses](#http-status-codes-on-responses)
//-->

## 1.1 REST Service Resources

<p>
<i>Note: See Section 1.2 for information on error responses and other HTTP
status codes used by the service. Also note that X-AUTH-TOKEN needs to
be sent for each calls on the request header with the token obtained by
calling /users/token as described in Section 1.1.1.</i>
</p>

## 1.1.1 /users/token

**Methods**

<p><b>POST</b></p>


<p>Return a JSON Web Tokn (JWT) token after user id and password have been successfully validated.</p>

<p>
The JavaScript Web Token expire after 4 hours. The authentication token needs to be renewed prior to expiration by calling /users/renew. (See 1.1.2 below)
</p>

<p><i>Note on security</i>:the password is currently expected to be sent in plain text (not encrypted).<br> This is partly done to avoid unnecessary complexity. We believe it is best to rely on transport security (HTTPS) to encrypt user credentials.
</p>

<p><b>Sample Request</b></p>
<p><small><b>Request Payload</small></b>:<br>
<code>
{"username":"admin","password":"xxx"}
</code>
</p>

<p><b>Sample Response</b></p>
<p>No response is returned but the authentication token, with key X-AUTH-TOKEN, is appended to the response header such as below:
</p>
<code> 
<b>X-AUTH-TOKEN:</b><br>
<p>eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTQzOTMzNjQwNywianRpIjoiYWRtaW4iLCJyb2xlcyI6Im9wZW5ncmlkX2FkbWlucyIsImZuYW1lIjoiT3BlbkdyaWQiLCJsbmFtZSI6IkFkbWluIn0.nShqceUs52ykIxu0RBRp4vZ8zaQqfdZ2haZn8AWMqyq5GJHRQkddoOaaLtKABktr32C0zha1pMJJBrjuYoPHIQ
</p></code>

<p>
This token can be parsed using the <b><i>jwt_decode</i></b> JavaScript Web Token library (See <a href="https://github.com/auth0/jwt-decode"> https://github.com/auth0/jwt-decode</a>)
</p>

<p><b>Error Codes</b><br>
If user authentication fails, HTTP status code 401 (Unauthorized) is returned to the requester.
</p>


## 1.1.2 /users/renew

**Methods**
<p><b>POST</b></p>

<p>Renew the expiration date on an existing JSON Web Token (JWT) token. The existing token needs to be on the request header under key <i>X-AUTH-TOKEN</i>.
</p>

<p><b>Sample Response</b><br>
No response is returned but the authentication token with a new expiration time is appended to the response header, replacing the previous one. See 1.1.1 above for a sample token value.
</p>

## 1.1.3 /users

**Methods**
<p><b>GET</b></p>

<p>Return a list of users given a filter</p>

<p><b>Request Query Parameters</b></p>

<html>
<table>
<tr>
<th align="left">Parameter</th>
<th>Value</th>
<th>Description</th>
</tr>

<tr>
<td>q</td>
<td>String</td>
<td>
<p>Filter expression to use to search against the Open Grid user repository. Pass ‘{}’ (empty object) to specify ‘no filter’ or leave out this parameter altogether.<br> The query filter must follow the MongoDB query syntax, as with all other API calls that has a query filter parameter.<br> It is recommended that this value be URL encoded.
</p>
</td>
</tr>

<tr>
<td>n</td>
<td>Integer</td>
<td>
<p>The maximum number of records to return; If this parameter is not specified, no records are returned (i.e. default value of 0)</p>
</td>
</tr>
</table>
</html>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/users?q={}&n=1000
</code>
</p>

<p><b>Or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/users?q=%7B%7D&n=1000
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp;[ 
<br>
&nbsp; &nbsp;{
<br> &nbsp; &nbsp; &nbsp;
"&#95;id: { 
<br> &nbsp; &nbsp; &nbsp;
"$oid" : "55ca20b9c4aac050466bc1a3"}, 
<br> &nbsp; &nbsp; &nbsp;
"userId" : "tester1",
<br> &nbsp; &nbsp; &nbsp;
"password" : "password1",
<br> &nbsp; &nbsp; &nbsp;
"firstName" : "Tester",
<br> &nbsp; &nbsp; &nbsp;
"lastName" : "One",
<br> &nbsp; &nbsp; &nbsp;
"groups" : [ "opengrid_users_L1"]
<br> &nbsp; &nbsp; &nbsp;  } 
<br> &nbsp;]
</code>
</p>

<p><b>POST</b></p>

<p>
Create a new user. Returns object for newly created user, if successful.
</p>

<p><b>Sample Request</b><br>
<code>
&nbsp;{
<br>&nbsp;&nbsp;&nbsp;"id":null,
<br>&nbsp;&nbsp;&nbsp;"o":{
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "userId":"test3",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "password":"testxxx",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "firstName":"Test",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "lastName":"Three",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "groups":[]
<br>&nbsp; &nbsp; &nbsp; &nbsp;}
<br>&nbsp;&nbsp;}
</code>
</p>

<p><b>Sample Response</b>
<br>
<code>
&nbsp;{
<br>&nbsp;&nbsp;&nbsp;"userId":"test3",
<br>&nbsp;&nbsp;&nbsp;"password":"testxxx",
<br>&nbsp;&nbsp;&nbsp;"firstName":"Test",
<br>&nbsp;&nbsp;&nbsp;"lastName":"Three",
<br>&nbsp;&nbsp;&nbsp;"groups":[ ],
<br>&nbsp;&nbsp;&nbsp;"&#95;id":{
<br>&nbsp;&nbsp;&nbsp;"$oid":"55ca52dec4aac050466bc1a9"}
<br>&nbsp;}
</code>
</p>

## 1.1.4 /users/{user_id}

**Methods**
<p><b>GET</b></p>

<p>
Return a single user object given the user’s internal id.
</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/users/{"$oid":"55b63708a3db5f292c533c7b"} 
</code> 
</p>

<p><b>or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/users/%7B%22%24oid%22%3A%20%2255b63708a3db5f292c533c7b%22%7D
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp;{
<br>&nbsp;&nbsp;"&#95;id": { 
<br>&nbsp;&nbsp;"$oid" : "55b63708a3db5f292c533c7b"},
<br>&nbsp;&nbsp;"userId" : "TesterOne",
<br>&nbsp;&nbsp;"password" : "test123",
<br>&nbsp;&nbsp;"firstName" : "ABC Test",
<br>&nbsp;&nbsp;"lastName" : "One Update",
<br>&nbsp;&nbsp;"groups" : [ "opengrid_users_L1"]
<br>&nbsp;}
</code>
</p>

<p><b>PUT</b><br>
Update a user’s information. Returns the updated user data, if successful.
</p>

<p><b>Sample Request</b>
<br><b>URL:</b><br>
<code>
&lt;Service URL&gt;/users/{"$oid":"55ccaca15fc6c6bf8a807cf2"}
</code>
</p>

<p><b>or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/users/%7B%22$oid%22:%2255ccaca15fc6c6bf8a807cf2%22%7D
</code>
</p>

<p><b>Request Payload:</b><br>
<code>
&nbsp;{
<br>&nbsp;&nbsp;&nbsp; "id":{
<br>&nbsp;&nbsp;&nbsp; "$oid":"55ccaca15fc6c6bf8a807cf2"},
<br> &nbsp; &nbsp; &nbsp; "o":{
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "&#95;id":{
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "$oid":"55ccaca15fc6c6bf8a807cf2"},
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "userId":"twitterUser",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "password":"testxxx",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "firstName":"Twitter",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "lastName":"User",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "groups":["opengrid_users_L1","opengrid_users_L2"]
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;}
<br>&nbsp;}
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp;{
<br>&nbsp;&nbsp;&nbsp; "userId":"test3",
<br>&nbsp;&nbsp;&nbsp; "password":"testxxx",
<br>&nbsp;&nbsp;&nbsp; "firstName":"Test",
<br>&nbsp;&nbsp;&nbsp; "lastName":"3",
<br>&nbsp;&nbsp;&nbsp; "groups":[ ]
<br>&nbsp;}
</code>
</p>

<p><b>DELETE</b><p>
<p>Delete a user given the user’s internal Id on the URL path.
</p>

<p><b>Sample Request</b>
<br>
<code>
&lt;Service URL&gt;/users/{"$oid": "55b63708a3db5f292c533c7b"}
</code>
</p>

<p><b>or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/users/%7B%22%24oid%22%3A%20%2255b63708a3db5f292c533c7b%22%7D
</code>
</p>

<p><b>Sample Response</b>
<br>
No response is returned when a user is deleted successfully.
</p>

## 1.1.5 /groups

**Methods**

<p><b>GET</b></p>

<p>Return a list of OpenGrid groups (teams)</p>

<p><b>Request Query Parameters</b></p>

<html>
<table>
<tr>
<th align="left">Parameter</th>
<th>Value</th>
<th>Description</th>
</tr>

<tr>
<td>
q
</td>
<td>String</td>
<td>
<p>Filter expression to use to search against the Open Grid group repository. Pass ‘{}’ (empty object) to specify ‘no filter’ or leave out this parameter altogether. <br>
It is recommended that this value be URL encoded.
</p>
</td>
</tr>

<tr>
<td>n</td>
<td>Integer</td>
<td>
<p>
The maximum number of records to return; If this parameter is not specified, no records are returned (i.e. default value of 0)
</p>
</td>
</tr>
</table>
</html>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/groups?q={}&n=200
</code> 
</p>

<p><b>Or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/groups?q=%7B%7D&n=200
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp;[
<br>&nbsp;&nbsp;&nbsp;{ 
<br>&nbsp;&nbsp;&nbsp; "&#95;id" : { 
<br>&nbsp;&nbsp;&nbsp; "$oid" : "55c0c620a3db5f3058630eb3"},
<br>&nbsp;&nbsp;&nbsp; "groupId" : "opengrid_users",
<br>&nbsp;&nbsp;&nbsp; "name" : "OpenGrid Users",
<br>&nbsp;&nbsp;&nbsp; "description" : "Group for all OpenGrid users", "enabled" : true,
<br>&nbsp;&nbsp;&nbsp; "functions" : [ "Quick Search" , "Advanced Search"],
<br>&nbsp;&nbsp;&nbsp; "datasets" : [ "twitter" , "weather"]
<br>&nbsp;&nbsp;&nbsp;}
<br>&nbsp;]
</code>
</p>

<p><b>POST</b></p>
<p>
Create a new group. Returns object for newly created group, if successful.
</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/groups
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp;{
<br> &nbsp; &nbsp; &nbsp; &nbsp; "groupId" : "OPENGRID_NEWGROUP",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "name" : "ABC GROUP",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "description" : "ADD ABC GROUP",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "enabled" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; "functions" : [ ],
<br> &nbsp; &nbsp; &nbsp; &nbsp; "datasets" : [ ] ,
<br> &nbsp; &nbsp; &nbsp; &nbsp; "&#95;id" : { "$oid" : "55cb6362c4aa475d78d4bc40"}
<br>&nbsp;}
</code>
</p>

## 1.1.6 /groups/{group_id}

**Methods**
<p><b><i>GET</i></b></p>

<p>Return a single group given a group’s internal id.</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/groups/{"$oid": "55c0c620a3db5f3058630eb3"}
</code> 
</p>

<p><b>or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/groups/%7B%22%24oid%22%3A%20%2255c0c620a3db5f3058630eb3%22%7D
</code>
</p>


<p><b>Sample Response</b><br>
<code>
&nbsp;[
<br> &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; "&#95;id" : { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "$oid" : "55c0c620a3db5f3058630eb3"},
<br> &nbsp; &nbsp; &nbsp; &nbsp; "groupId" : "opengrid_users",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "name" : "OpenGrid Users",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "description" : "Group for all OpenGrid users",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "enabled" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; "functions" : ["Quick Search", "Advanced Search"],
<br> &nbsp; &nbsp; &nbsp; &nbsp; "datasets" : ["twitter", "weather"]
<br> &nbsp; &nbsp; }
<br>&nbsp;]
</code>
</p>

<p><b><i>PUT</i></b></p>

<p>
Update a group (group-level attributes and members). Returns the updated group data, if successful.
</p>

<p><b>Sample Request</b><br>
<b>URL:</b><br>
<code>
&lt;Service URL&gt;/groups/{"$oid":"55c525c6c4aae748132f4d06"}
</code> 
</p>

<p><b><small>or when URL encoded:</b></small><br>
<code>
&lt;Service URL&gt;/groups/%7B%22%24oid%22%3A%2255c525c6c4aae748132f4d06%22%7D
</code> 
</p>

<p><b><small>Request Payload:</b></small><br> 
<code>
&nbsp;{
<br> &nbsp; &nbsp; &nbsp;"id":{
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "$oid":"55c525c6c4aae748132f4d06"},
<br> &nbsp; &nbsp; &nbsp; "o":{
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "groupId":"opengrid_users_L2",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "name":"OpenGrid Users Level 2",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "description":"Users with access to weather data",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "enabled":true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "isAdmin":false,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "functions":["Quick Search","Advanced Search"],
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "datasets":["weather"]
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
<br>&nbsp;}
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp;{
<br> &nbsp; &nbsp; &nbsp; "groupId" : "opengrid_users_L2",
<br> &nbsp; &nbsp; &nbsp; "name" : "OpenGrid Users Level 2",
<br> &nbsp; &nbsp; &nbsp; "description" : "Users with access to weather data",
<br> &nbsp; &nbsp; &nbsp; "enabled" : true,
<br> &nbsp; &nbsp; &nbsp; "isAdmin" : false,
<br> &nbsp; &nbsp; &nbsp; "functions" : ["Quick Search", "Advanced Search"],
<br> &nbsp; &nbsp; &nbsp; "datasets" : ["weather"]
<br> &nbsp;}
</code>
</p>

<p><b><i>DELETE</i></b></p>

<p>
Delete a group given the group’s internal Id on the URL path.
</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/groups/{"$oid":"55cb6362c4aa475d78d4bc40"}
</code>
</p>

<p><b>or when URL encoded:</b><br>
<code>&lt;Service URL&gt;/groups/%7B%22$oid%22:%2255cb6362c4aa475d78d4bc40%22%7D
</code>
</p>

<p><b>Sample Response</b><br>
No response is returned when a group is deleted successfully.
</p>

## 1.1.7 /datasets

**Methods** 
<p><b><i>GET</i></b></th>

<p>
Return a list of available datasets. The response is a JSON array of descriptors for each available dataset.
</p>

<p><b>Sample Request</b><br>
<code>&lt;Service URL&gt;/datasets
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp; [
<br> &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "twitter",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Twitter",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "options" : { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "rendition" :{
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; "icon" : "default", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; "color" : "#001F7A", "fillColor" : "#00FFFF",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; "opacity" : 85,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "size" : 6 }
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, "columns": 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; [ 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "&#95;id",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "ID",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : false, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : false, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : false },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "date", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Date",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "date", "filter" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : true, "list" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 1},
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id": "screenName",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Screen Name",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string", "filter" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : true, "list" : true, "sortOrder" : 2,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "groupBy" : true },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "text", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Text",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : true, "list" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder": 3},
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "city", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "City",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : true, "list" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 4,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "groupBy" : true},
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" :"bio",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Bio",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 5},
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "hashtags",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Hashtags",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 6},
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "lat", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Latitude",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 7},
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "long",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Longitude",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 8 }
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ] },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "weather",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Weather",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "options" :
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { "rendition" :
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "icon" : "default",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "color" : "#8c2d04", "fillColor" : "#fdae6b",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "opacity" : 85, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "size" : 6
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, "columns" : 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; [ 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id :" "&#95;id", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "ID",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : false, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : false, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : false
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "temp",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Temperature",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : true, "list" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 1
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "windspeed",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Wind Speed",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true, "sortOrder" : 2
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "condition",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Condition",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true, "sortOrder" : 3
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "humidity",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Humidity",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true, "sortOrder" : 4
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "precipIntensity",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Precipitation Intensity",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true , "sortOrder" : 5
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "date",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Date",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "date",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true, "sortOrder" : 5
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "zipcode",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Zip Code",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true, "sortOrder" : 6 ,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "values" : [ 60601 , 60602], "groupBy" : true
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" :"forecast",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Today's Forecast",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : true, "list" : true , "sortOrder" : 7
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "icon",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Icon",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "graphic", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : true , "sortOrder" : 7
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "lat",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Latitude",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true , "sortOrder" : 8
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "long",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Longitude",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float", "list" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 9
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]
<br> &nbsp; &nbsp; }
<br> &nbsp;] 
</code>
</p>

  
## 1.1.8 /datasets/{dataset_id}

**Methods**

<p><b><i>GET</i></p>

<p>
Return a single dataset descriptor. An HTTP 403 is returned when the user has no access to the dataset requested.
</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/datasets/twitter
</code>
</p>

<p><b>Sample Response</b><br>
<code>
<br> &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; "id" : "twitter",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Twitter", "options" : 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { "rendition" :
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { "icon" : "default",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "color" : "#001F7A", "fillColor" : "#00FFFF", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "opacity" : 85, "size" : 6
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "columns" : [ {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "&#95;id",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "ID",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : false, "popup" : false, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : false 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "date", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Date", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "date", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true , "sortOrder": 1
<br> &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "screenName",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Screen Name", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true, "sortOrder" : 2,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "groupBy" : true 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "text", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Text",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "popup" : true, "list" : true,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 3
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "city", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "City",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true , "sortOrder" : 4, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "groupBy" : true
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "bio",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Bio", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string", "sortOrder" : 5
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "hashtags", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Hashtags",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 6
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "lat", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Latitude",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "list" : true , "sortOrder" : 7
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "long",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Longitude", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "float", "list" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sortOrder" : 8
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
<br> &nbsp; &nbsp; ]
<br> &nbsp; &nbsp; &nbsp; }
</code>
</p>

## 1.1.9 /datasets/{dataset_id}/query

**Methods**
<p><b>GET</b></p>

<p>Execute a query against a specific dataset.</p>

<p><b>Request Query Parameters</b></p>

<html>
<table>
<tr>
<th align="left">Parameter</th>
<th>Value</th>
<th>Description</th>
</tr>

<tr>
<td>
q
</td>
<td>String</td>
<td>
<p>
Filter expression to use to against the specified dataset Pass ‘{}’ (empty object) to specify ‘no filter’ or leave out this parameter altogether.
</p>
<p>
The query filter must follow the MongoDB query syntax, as with all other API calls that has a query filter parameter.<br> 
It is recommended that this value be URL encoded.
</p>
</td>
</tr>

<tr>
<td>n</td>
<td>Integer</td>
<td><p>The maximum number of records to return; If this parameter is not specified, no records are returned (i.e. default value of 0)</p>
</td>
</tr>
</table>
</html>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/datasets/twitter/query?q={"$and":[{"text":{"$regex":"happy"}}]}&n=1
</code> 
</p>

<p><b><small>Or when URL encoded:</small></b><br>
<code>
&lt;Service URL&gt;/datasets/twitter/query?q=%7B%22$and%22:%5B%7B%22text%22:%7B%22$regex%22:%22happy%22%7D%7D%5D%7D&n=1
</code>
</p>

<p><b>Sample Response</b></br>
<code>
&nbsp; {
<br> &nbsp; &nbsp; &nbsp; "type" : "FeatureCollection", 
<br> &nbsp; &nbsp; &nbsp; "features" : [
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "type": "Feature", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "properties": 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { "&#95;id" : 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; { "$oid" : "556e6f18aef407e1dc98685e"},
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "date" : "05/02/2012 8:24 AM",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "screenName" : "DeeeEmmm", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "text" : "Just talked to bleep last nyt.... Felt happy, but sad in a lot of ways....",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "city" : "Chicago, IL", "bio" : "I'm the female version of Ari Gold!" , "lat" : 41.84770456 , "long" : -87.8521837,
<br> &nbsp; &nbsp; &nbsp; &nbsp; "hashtags" : ""},
<br> &nbsp; &nbsp; &nbsp; &nbsp; "geometry": {"type": "Point", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "coordinates": [-87.8521837,41.84770456]}, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "autoPopup": false }],
<br> &nbsp; &nbsp; &nbsp; &nbsp; "meta": { "view": { "id" : "twitter",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "Twitter", "options" : {"rendition" :
<br> &nbsp; &nbsp; &nbsp; &nbsp; {"icon" : "default", "color" : "#001F7A", "fillColor" : "#00FFFF", "opacity" : 85 , "size" : 6}},
<br> &nbsp; &nbsp; &nbsp; &nbsp; "columns" : [ {"id" : "&#95;id", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "displayName" : "ID", "dataType" : "string", "filter" : false, "popup" : false, "list" : false},
<br> &nbsp; &nbsp; &nbsp; &nbsp; {"id" : "date", "displayName" : "Date", "dataType" : "date", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true, "list" : true, "sortOrder" : 1},
<br> &nbsp; &nbsp; &nbsp; &nbsp; {"id" : "screenName", "displayName" : "Screen Name", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "dataType" : "string", "filter" : true, "popup" : true, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "list" : true, "sortOrder" : 2, "groupBy" : true},
<br> &nbsp; &nbsp; &nbsp; &nbsp; {"id" : "text", "displayName" : "Text", "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true, "list" : true, "sortOrder" : 3},
<br> &nbsp; &nbsp; &nbsp; &nbsp; {"id" : "city", "displayName" : "City", "dataType" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "filter" : true, "popup" : true, "list" : true, "sortOrder" : 4, "groupBy" : true},
<br> &nbsp; &nbsp; &nbsp; &nbsp; {"id" : "bio", "displayName" : "Bio", "dataType" : "string", "sortOrder" : 5},
<br> &nbsp; &nbsp; &nbsp; &nbsp; {"id" : "hashtags", "displayName" : "Hashtags", "dataType" : "string", "sortOrder" : 6},
<br> &nbsp; &nbsp; &nbsp; &nbsp; {"id" : "lat", "displayName" : "Latitude", "dataType" : "float", "list" : true, "sortOrder" : 7},
<br> &nbsp; &nbsp; &nbsp; &nbsp; {"id" : "long", "displayName" : "Longitude", "dataType" : "float", "list" : true , "sortOrder" : 8}
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; } 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
<br> &nbsp; }
</code>
</p>

## 1.1.10 /queries

**Methods**
<p><b>GET</b></p>

<p>Return list of all queries that user has access to. A user has access to all queries he or she has created and those shared with his groups or shared with him directly by other users.
</p>

<p><b>Request Query Parameters</b></p>

<html>
<table>
<tr>
<th align="left">Parameter</th>
<th>Value</th>
<th>Description</th>
</tr>

<tr>
<td>
q</td>
<td>
String
</td>
<td>
<p>
Filter expression to use. Pass ‘{}’ (empty object) to specify ‘no filter’ or leave out this parameter altogether.
<br>
It is recommended that this value be URL encoded.
</p>
</td>
</tr>

<tr>
<td>n
</td>
<td>
Integer
</td>
<td>
<p>
maximum number of records to return; If this parameter is not specified, no records are returned (i.e. default value of 0).
</p>
</td>
</tr>
</table>
</html>

<p><b>Sample Request</b><br>
<code>&lt;Service URL&gt;/queries?n=1
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp; [
<br> &nbsp; &nbsp; {"&#95;id" :
<br> &nbsp; &nbsp; &nbsp; {"$oid" : "5582f831a3db5f4190e4707a"},
<br> &nbsp; &nbsp; &nbsp; "name" : "Weather Records for 60601", "owner" : "jsmith", "spec" :
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; [ 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {"dataSetId" : "weather", "filters" : {"condition" : "AND", "rules" : 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; [ {"id" : "zipcode", "field" : "zipcode", "type" : "string", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "input" : "text", "operator" : "equal", "value" : "60601"}
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "rendition" : {"color" : "#DC143C", "opacity" : 85, "size" : 6}
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ],
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "sharedWith" : { "users" : [ ], "groups" : [ ]}, 
<br> &nbsp; "isCommon" : true}
<br> &nbsp; ]
</code>
</p>

<p><b>POST</b><br>
Create a new query. Returns object for newly created query, if successful.
</p>

<p><b>Sample Request</b>
<br>
<b><small>Request Payload</b></small><br>
<code>
&nbsp; {
<br> &nbsp; &nbsp; "o":{
<br> &nbsp; &nbsp; &nbsp; &nbsp; "name":"Tweets By Bud",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "owner":"user1","spec":
<br> &nbsp; &nbsp; [
<br> &nbsp; &nbsp; &nbsp; {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataSetId":"twitter",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "filters":{
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "condition":"AND","rules":[{
<br> &nbsp; &nbsp; &nbsp; "id":"screenName",
<br> &nbsp; &nbsp; &nbsp; "field":"screenName",
<br> &nbsp; &nbsp; &nbsp; "type":"string","input":"text",
<br> &nbsp; &nbsp; &nbsp; "operator":"contains","value":"bud"}]
<br> &nbsp; &nbsp; &nbsp; },"rendition":{
<br> &nbsp; &nbsp; &nbsp; "color":"#DC143C","opacity":"85","size":"6"}
<br> &nbsp; &nbsp; &nbsp; }
<br> &nbsp; &nbsp; &nbsp; &nbsp; ],
<br> &nbsp; &nbsp; &nbsp; "sharedWith":{
<br> &nbsp; &nbsp; &nbsp; "users":[],
<br> &nbsp; &nbsp; &nbsp; "groups":[]
<br> &nbsp; &nbsp; },"isCommon":false,
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "autoRefresh":false,"refreshInterval":"30",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "geoFilter":{"boundaryType":"within","boundary":""}
<br> &nbsp; &nbsp; &nbsp; }
<br> &nbsp; }
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp; {
<br> &nbsp; &nbsp; &nbsp; "name" : "Tweets By Bud",
<br> &nbsp; &nbsp; &nbsp; "owner" : "user1",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "spec" : [ {
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataSetId" : "twitter",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filters" : { 
<br> &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;  &nbsp;  &nbsp; "condition" : "AND",
<br> &nbsp; &nbsp;  &nbsp;  &nbsp;  &nbsp; "rules" : [ { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "screenName",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "field" : "screenName",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "type" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "input" : "text", 
<br> &nbsp; &nbsp; &nbsp; "operator" : "contains" , "value" : "bud"}]
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "rendition" : {"color" : "#DC143C",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "opacity" : "85", "size" : "6"
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }],
<br> &nbsp; &nbsp; &nbsp; &nbsp; "sharedWith" : { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "users" : [ ], 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "groups" : [ ] &nbsp;},
<br> &nbsp; &nbsp; &nbsp; &nbsp; "isCommon" : false, 
<br> &nbsp; &nbsp; &nbsp; &nbsp; "autoRefresh" : false, "refreshInterval" : "30",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "geoFilter" : { "boundaryType" : "within" , "boundary" : ""},
<br> &nbsp; &nbsp; &nbsp; &nbsp; "&#95;id" : { "$oid" : "55df5ec39900ec81a481b0f6"}
<br> &nbsp; }
</code>
</p>

## 1.1.11 /queries/{query_id}

**Methods**

<p><b>GET</b></p>

<p>Return a single query given a query’s internal id.</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/queries/{"$oid":"5582f831a3db5f4190e4707a"} 
</code> 
</p>

<p><b>or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/queries/%7B%22$oid%22:%5582f831a3db5f4190e4707a%22%7D
</code>
</p>

<p><b>Sample Response</b>
<br>
<code>
[
<br> &nbsp; {"&#95;id" :
<br> &nbsp; &nbsp; { "$oid" : "5582f831a3db5f4190e4707a"},
<br> &nbsp; &nbsp; "name" : "Weather Records for 60601",
<br> &nbsp; &nbsp; "owner" : "jsmith", "spec" : [ { "dataSetId" : "weather",
<br> &nbsp; &nbsp; "filters" : { "condition" : "AND" , "rules" : 
<br> &nbsp; &nbsp; &nbsp; [{ "id" : "zipcode" , "field" : "zipcode", 
<br> &nbsp; &nbsp; &nbsp; "type" : "string", "input" : "text",
<br> &nbsp; &nbsp; &nbsp; "operator" : "equal", "value" : "60601"
<br> &nbsp; &nbsp; &nbsp; &nbsp; }]
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }, "rendition" : { "color" : "#DC143C", "opacity" : 85, "size" : 6}
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }], "sharedWith" : { "users" : [ ], "groups" : [ ]},
<br> &nbsp; "isCommon" : true}
<br> ]
</code>
</p>

<p><b>PUT</b><br>
Update a query. Returns the updated query object, if successful.
</p>

<p><b>Sample Request</b>
<br><b>URL:</b><br>
<code>
&lt;Service URL&gt;/queries/{"$oid":"55c52cf6c4aa31b24b04d620"} 
</code> 
</p>

<p><b><small>or when URL encoded:</b></small><br>
<code>
&lt;Service URL&gt;/queries/%7B%22$oid%22:%2255c52cf6c4aa31b24b04d620%22%7D
</code>
</p>

<p><b>Sample Response</b><br>
<code>
&nbsp; {
<br> &nbsp; &nbsp; &nbsp; "name" : "Tweets on coupon",
<br> &nbsp; &nbsp; &nbsp; "owner" : "user1", 
<br> &nbsp; &nbsp; &nbsp; "spec" : [ { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "dataSetId" : "twitter", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "filters" : { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "condition" : "AND",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "rules" : [ { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "id" : "text",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "field" : "text",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "type" : "string",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "input" : "text",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "operator" : "contains", 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "value" : "coupon"}]
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;},
<br> &nbsp; &nbsp; &nbsp; &nbsp; "rendition" : { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "color" : "#DC143C",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "opacity" : "85",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "size" : "6"}
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }],
<br> &nbsp; &nbsp; &nbsp; &nbsp; "sharedWith" : { "users" : [ ],
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "groups" : [ ]
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  },
<br> &nbsp; &nbsp; &nbsp; &nbsp; "isCommon" : false,
<br> &nbsp; &nbsp; &nbsp; &nbsp; "autoRefresh" : false,
<br> &nbsp; &nbsp; &nbsp; &nbsp; "refreshInterval" : "30",
<br> &nbsp; &nbsp; &nbsp; &nbsp; "&#95;id" : { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "$oid" : "55c52cf6c4aa31b24b04d620"},
<br> &nbsp; &nbsp; &nbsp; &nbsp; "geoFilter" : { 
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "boundaryType" : "within",
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  "boundary" : ""}
<br> &nbsp; }
</code>
</p>

<p><b>DELETE</b></p>
<p>Delete a query given the query’s internal Id on the URL path.</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/queries/{"$oid":"55cb6362c4aa475d78d4bc40"}
</code> 
</p>

<p><b>or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/queries/%7B%22%24oid%22%3A%2255cb6362c4aa475d78d4bc40%22%7D 
</code>
</p>

<p><b>Sample Response</b>
<br>
No response is returned when a query is deleted.
</p>


## 1.2 HTTP Status Codes on Response

<ul><li>HTTP 401 is returned when users/token is called and authentication fails.
</li>

<li>HTTP 403 is returned when current user does not have appropriate permissions to access a requested resource. This error code is also returned when the authentication database is unavailable.
</li>

<li>HTTP 200 is returned for any successful request or any handled exceptions. To detect a failure, look for an error object. In case of failure, an error objectis returned with the format below:
</li></ul>

<code>
&nbsp; {
<br> &nbsp; &nbsp; “error”: {
<br> &nbsp; &nbsp; &nbsp; &nbsp; “code”: “&lt;error code&gt;”
<br> &nbsp; &nbsp; &nbsp; &nbsp; “message”: “&lt;error message&gt;”
<br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }
<br> &nbsp;&nbsp; }
</code>

<p>
where &lt;error code&gt; is a code corresponding to the error that occurred and &lt;error message&gt; is a description of the error.
</p>

<ul><li>HTTP 500 for any unhandled system errors. The response body will contain details about the error. In most cases, (and this depends on the server infrastructure where the service is deployed) the response body will be an HTML-formatted text.
</li>

<li>HTTP 204 (No Content) is returned when an object is deleted successfully (DELETE method where applicable).
</li></ul>

<br>

<a href="#top">Back to top</a>
