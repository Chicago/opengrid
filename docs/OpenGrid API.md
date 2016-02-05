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
<br>
<code> 
<b>X-AUTH-TOKEN:</b><br>
eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTQzOTMzNjQwNywianRpIjoiYWRtaW4iLCJyb2xlcyI6Im9wZW5ncmlkX2FkbWlucyIsImZuYW1lIjoiT3BlbkdyaWQiLCJsbmFtZSI6IkFkbWluIn0.nShqceUs52ykIxu0RBRp4vZ8zaQqfdZ2haZn8AWMqyq5GJHRQkddoOaaLtKABktr32C0zha1pMJJBrjuYoPHIQ
</code>
</p>

<p>
This token can be parsed using the <b><i>jwt_decode</i></b> JavaScript Web Token library (See <a href="https://github.com/auth0/jwt-decode"> https://github.com/auth0/jwt-decode</a>)
</p>

<p><b>Error Codes</b><br>
If user authentication fails, HTTP status code 401 (Unauthorized) is returned to the requester.
</p>

## 1.1.2 /users/renew
**Methods**
<p><b>POST</b><br>
Renew the expiration date on an existing JSON Web Token (JWT) token. The existing token needs to be on the request header under key <i>X-AUTH-TOKEN</i>.
</p>

<p><b>Sample Response</b><br>
No response is returned but the authentication token with a new expiration time is appended to the response header, replacing the previous one. See 1.1.1 above for a sample token value.
</p>

## 1.1.3 /users

**Methods**
<p><b>GET</b><br>
Return a list of users given a filter</p>

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
[{"&#95;: { "$oid" : "55ca20b9c4aac050466bc1a3"} , "userId" : "tester1" , "password" : "password1" , "firstName" : "Tester" , "lastName" : "One" , "groups" : [ "opengrid_users_L1"]}]
</code>
</p>

<p><b>POST</b><br>
Create a new user. Returns object for newly created user, if successful.
</p>

<p><b>Sample Request</b><br>
<code>
{"id":null,"o":{"userId":"test3","password":"testxxx","firstName":"Test","lastName":"Three","groups":[]}}
</code>
</p>

<p><b>Sample Response</b>
<br>
<code>
{"userId":"test3", "password":"testxxx", "firstName":"Test", "lastName":"Three", "groups":[ ],"&#95;id":{"$oid":"55ca52dec4aac050466bc1a9"}}
</code>
</p>

## 1.1.4 /users/{user_id}
**Methods**
<p><b>GET</b>
<br>
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
{"&#95;id" : { "$oid" : "55b63708a3db5f292c533c7b"} , "userId" : "TesterOne" , "password" : "test123" , "firstName" : "ABC Test" , "lastName" : "One Update" , "groups" : [ "opengrid_users_L1"]}
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
{"id":{"$oid":"55ccaca15fc6c6bf8a807cf2"},"o":{"&#95;id":{"$oid":"55ccaca15fc6c6bf8a807cf2"},"userId":"twitterUser","password":"testxxx","firstName":"Twitter","lastName":"User","groups":["opengrid_users_L1","opengrid_users_L2"]}}
</code>
</p>

<p><b>Sample Response</b><br>
<code>
{"userId":"test3", "password":"testxxx", "firstName":"Test", "lastName":"3", "groups":[ ]}
</code>
</p>

<p><b>DELETE</b><br>
Delete a user given the user’s internal Id on the URL path.
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
<p><b>GET</b><br>
Return a list of OpenGrid groups (teams)
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
[{ "_id" : { "$oid" : "55c0c620a3db5f3058630eb3"} , "groupId" : "opengrid_users" , "name" : "OpenGrid Users" , "description" : "Group for all OpenGrid users" , "enabled" : true , "functions" : [ "Quick Search" , "Advanced Search"] , "datasets" : [ "twitter" , "weather"]}]
</code>
</p>

<p><b>POST</b><br>
Create a new group. Returns object for newly created group, if successful.
</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/groups
</code>
</p>

<p><b>Sample Response</b><br>
<code>
{"groupId" : "OPENGRID_NEWGROUP" , "name" : "ABC GROUP" , "description" : "ADD ABC GROUP" , "enabled" : true , "functions" : [ ] , "datasets" : [ ] , "&#95;id" : { "$oid" : "55cb6362c4aa475d78d4bc40"}}
</code>
</p>

## 1.1.6 /groups/{group_id}
**Methods**
<p><b><i>GET</i></b><br>
Return a single group given a group’s internal id.
</p>

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
[{"_id" : { "$oid" : "55c0c620a3db5f3058630eb3"} , "groupId" : "opengrid_users" , "name" : "OpenGrid Users" , "description" : "Group for all OpenGrid users" , "enabled" : true , "functions" : [ "Quick Search" , "Advanced Search"] , "datasets" : [ "twitter" , "weather"]}]
</code>
</p>

<p><b><i>PUT</i></b><br>
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
{"id":{"$oid":"55c525c6c4aae748132f4d06"},"o":{"groupId":"opengrid_users_L2","name":"OpenGrid Users Level 2","description":"Users with access to weather data","enabled":true,"isAdmin":false,"functions":["Quick Search","Advanced Search"],"datasets":["weather"]}}}
</code>
</p>

<p><b>Sample Response</b><br>
<code>
{"groupId" : "opengrid_users_L2" , "name" : "OpenGrid Users Level 2" , "description" : "Users with access to weather data" , "enabled" : true , "isAdmin" : false , "functions" : [ "Quick Search" , "Advanced Search"] , "datasets" : ["weather"]}
</code>
</p>

<p><b><i>DELETE</i></b><br>
Delete a group given the group’s internal Id on the URL path.
</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/groups/{"$oid":"55cb6362c4aa475d78d4bc40"}
</code>
</p>

<p><b>or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/groups/%7B%22$oid%22:%2255cb6362c4aa475d78d4bc40%22%7D
</code>
</p>

<p><b>Sample Response</b><br>
No response is returned when a group is deleted successfully.
</p>

## 1.1.7 /datasets
**Methods** 
<p><b><i>GET</i></b><br>
Return a list of available datasets. The response is a JSON array of descriptors for each available dataset.
</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/datasets
</code>
</p>

<p><b>Sample Response</b><br>
<code>
[{ "id" : "twitter" , "displayName" : "Twitter" , "options" : { "rendition" : { "icon" : "default" , "color" : "#001F7A" , "fillColor" : "#00FFFF" , "opacity" : 85 , "size" : 6}} , "columns" : [ { "id" : "_id" , "displayName" : "ID" , "dataType" : "string" , "filter" : false , "popup" : false , "list" : false} , { "id" : "date" , "displayName" : "Date" , "dataType" : "date" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 1} , { "id" : "screenName" , "displayName" : "Screen Name" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 2 , "groupBy" : true} , { "id" : "text" , "displayName" : "Text" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 3} , { "id" : "city" , "displayName" : "City" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 4 , "groupBy" : true} , { "id" : "bio" , "displayName" : "Bio" , "dataType" : "string" , "sortOrder" : 5} , { "id" : "hashtags" , "displayName" : "Hashtags" , "dataType" : "string" , "sortOrder" : 6} , { "id" : "lat" , "displayName" : "Latitude" , "dataType" : "float" , "list" : true , "sortOrder" : 7} , { "id" : "long" , "displayName" : "Longitude" , "dataType" : "float" , "list" : true , "sortOrder" : 8}]}, { "id" : "weather" , "displayName" : "Weather" , "options" : { "rendition" : { "icon" : "default" , "color" : "#8c2d04" , "fillColor" : "#fdae6b" , "opacity" : 85 , "size" : 6}} , "columns" : [ { "id" : "_id" , "displayName" : "ID" , "dataType" : "string" , "filter" : false , "popup" : false , "list" : false} , { "id" : "temp" , "displayName" : "Temperature" , "dataType" : "float" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 1} , { "id" : "windspeed" , "displayName" : "Wind Speed" , "dataType" : "float" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 2} , { "id" : "condition" , "displayName" : "Condition" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 3} , { "id" : "humidity" , "displayName" : "Humidity" , "dataType" : "float" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 4} , { "id" : "precipIntensity" , "displayName" : "Precipitation Intensity" , "dataType" : "float" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 5} , { "id" : "date" , "displayName" : "Date" , "dataType" : "date" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 5} , { "id" : "zipcode" , "displayName" : "Zip Code" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 6 , "values" : [ 60601 , 60602] , "groupBy" : true} , { "id" : "forecast" ,"displayName" : "Today's Forecast" , "dataType" : "string" , "popup" : true , "list" : true , "sortOrder" : 7} , { "id" : "icon" , "displayName" : "Icon" , "dataType" : "graphic" , "popup" : true , "sortOrder" : 7} , { "id" : "lat" , "displayName" : "Latitude" , "dataType" : "float" , "list" : true , "sortOrder" : 8} , { "id" : "long" , "displayName" : "Longitude" , "dataType" : "float" , "list" : true , "sortOrder" : 9}]}] 
</code>
</p>

## 1.1.8 /datasets/{dataset_id}
**Methods**
<p><b><i>GET</i></b><br>
Return a single dataset descriptor. An HTTP 403 is returned when the user has no access to the dataset requested.
</p>

<p><b>Sample Request</b><br>
<code>
&lt;Service URL&gt;/datasets/twitter
</code>
</p>

<p><b>Sample Response</b><br>
<code>
{"id" : "twitter" , "displayName" : "Twitter" , "options" : { "rendition" : { "icon" : "default" , "color" : "#001F7A" , "fillColor" : "#00FFFF" , "opacity" : 85 , "size" : 6}} , "columns" : [ { "id" : "&#95;id" , "displayName" : "ID" , "dataType" : "string" , "filter" : false , "popup" : false , "list" : false} , { "id" : "date" , "displayName" : "Date" , "dataType" : "date" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 1} , { "id" : "screenName" , "displayName" : "Screen Name" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 2 , "groupBy" : true} , { "id" : "text" , "displayName" : "Text" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 3} , { "id" : "city" , "displayName" : "City" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 4 , "groupBy" : true} , { "id" : "bio" , "displayName" : "Bio" , "dataType" : "string" , "sortOrder" : 5} , { "id" : "hashtags" , "displayName" : "Hashtags" , "dataType" : "string" , "sortOrder" : 6} , { "id" : "lat" , "displayName" : "Latitude" , "dataType" : "float" , "list" : true , "sortOrder" : 7} , { "id" : "long" , "displayName" : "Longitude" , "dataType" : "float" , "list" : true , "sortOrder" : 8}]}
</code>
</p>

## 1.1.9 /datasets/{dataset_id}/query
**Methods**
<p><b>GET</b>
<br>
Execute a query against a specific dataset.
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
{"type" : "FeatureCollection", "features" : [{"type": "Feature", "properties": { "_id" : { "$oid" : "556e6f18aef407e1dc98685e"} , "date" : "05/02/2012 8:24 AM" , "screenName" : "DeeeEmmm" , "text" : "Just talked to bleep last nyt.... Felt happy, but sad in a lot of ways...." , "city" : "Chicago, IL" , "bio" : "I'm the female version of Ari Gold!" , "lat" : 41.84770456 , "long" : -87.8521837 , "hashtags" : ""}, "geometry": {"type": "Point", "coordinates": [-87.8521837,41.84770456]}, "autoPopup": false }],"meta": { "view": { "id" : "twitter" , "displayName" : "Twitter" , "options" : { "rendition" : { "icon" : "default" , "color" : "#001F7A" , "fillColor" : "#00FFFF" , "opacity" : 85 , "size" : 6}} , "columns" : [ { "id" : "_id" , "displayName" : "ID" , "dataType" : "string" , "filter" : false , "popup" : false , "list" : false} , { "id" : "date" , "displayName" : "Date" , "dataType" : "date" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 1} , { "id" : "screenName" , "displayName" : "Screen Name" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 2 , "groupBy" : true} , { "id" : "text" , "displayName" : "Text" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 3} , { "id" : "city" , "displayName" : "City" , "dataType" : "string" , "filter" : true , "popup" : true , "list" : true , "sortOrder" : 4 , "groupBy" : true} , { "id" : "bio" , "displayName" : "Bio" , "dataType" : "string" , "sortOrder" : 5} , { "id" : "hashtags" , "displayName" : "Hashtags" , "dataType" : "string" , "sortOrder" : 6} , { "id" : "lat" , "displayName" : "Latitude" , "dataType" : "float" , "list" : true , "sortOrder" : 7} , { "id" : "long" , "displayName" : "Longitude" , "dataType" : "float" , "list" : true , "sortOrder" : 8}]} }}
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
[{"&#95;id" : { "$oid" : "5582f831a3db5f4190e4707a"} , "name" : "Weather Records for 60601" , "owner" : "jsmith" , "spec" : [ { "dataSetId" : "weather" , "filters" : { "condition" : "AND" , "rules" : [ { "id" : "zipcode" , "field" : "zipcode" , "type" : "string" , "input" : "text" , "operator" : "equal" , "value" : "60601"}]} , "rendition" : { "color" : "#DC143C" , "opacity" : 85 , "size" : 6}}] , "sharedWith" : { "users" : [ ] , "groups" : [ ]} , "isCommon" : true}]
</code>
</p>

<p><b>POST</b><br>
Create a new query. Returns object for newly created query, if successful.
</p>

<p><b>Sample Request</b>
<br>
<b><small>Request Payload</b></small><br>
<code>
{"o":{"name":"Tweets By Bud","owner":"user1","spec":[{"dataSetId":"twitter","filters":{"condition":"AND","rules":[{"id":"screenName","field":"screenName","type":"string","input":"text","operator":"contains","value":"bud"}]},"rendition":{"color":"#DC143C","opacity":"85","size":"6"}}],"sharedWith":{"users":[],"groups":[]},"isCommon":false,"autoRefresh":false,"refreshInterval":"30","geoFilter":{"boundaryType":"within","boundary":""}}}
</code>
</p>

<p><b>Sample Response</b><br>
<code>
{"name" : "Tweets By Bud" , "owner" : "user1" , "spec" : [ { "dataSetId" : "twitter" , "filters" : { "condition" : "AND" , "rules" : [ { "id" : "screenName" , "field" : "screenName" , "type" : "string" , "input" : "text" , "operator" : "contains" , "value" : "bud"}]} , "rendition" : { "color" : "#DC143C" , "opacity" : "85" , "size" : "6"}}] , "sharedWith" : { "users" : [ ] , "groups" : [ ]} , "isCommon" : false , "autoRefresh" : false , "refreshInterval" : "30" , "geoFilter" : { "boundaryType" : "within" , "boundary" : ""} , "&#95;id" : { "$oid" : "55df5ec39900ec81a481b0f6"}}
</code>
</p>

## 1.1.11 /queries/{query_id}
**Methods**
<p><b>GET</b>
<br>
Return a single query given a query’s internal id.
</p>

<p><b>Sample Request</b>
<br>
<code>
&lt;Service URL&gt;/queries/{"$oid":"5582f831a3db5f4190e4707a"} 
</code> 
</p>

<p><b>or when URL encoded:</b>
<br>
<code>
&lt;Service URL&gt;/queries/%7B%22$oid%22:%5582f831a3db5f4190e4707a%22%7D
</code>
</p>

<p><b>Sample Response</b>
<br>
<code>
[{"&#95;id" : { "$oid" : "5582f831a3db5f4190e4707a"} , "name" : "Weather Records for 60601" , "owner" : "jsmith" , "spec" : [ { "dataSetId" : "weather" , "filters" : { "condition" : "AND" , "rules" : [ { "id" : "zipcode" , "field" : "zipcode" , "type" : "string" , "input" : "text" , "operator" : "equal" , "value" : "60601"}]} , "rendition" : { "color" : "#DC143C" , "opacity" : 85 , "size" : 6}}] , "sharedWith" : { "users" : [ ] , "groups" : [ ]} , "isCommon" : true}]
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

<p><b>or when URL encoded:</b><br>
<code>
&lt;Service URL&gt;/queries/%7B%22$oid%22:%2255c52cf6c4aa31b24b04d620%22%7D
</code>
</p>

<p><b>Sample Response</b><br>
<code>
{"name" : "Tweets on coupon" , "owner" : "user1" , "spec" : [ { "dataSetId" : "twitter" , "filters" : { "condition" : "AND" , "rules" : [ { "id" : "text" , "field" : "text" , "type" : "string" , "input" : "text" , "operator" : "contains" , "value" : "coupon"}]} , "rendition" : { "color" : "#DC143C" , "opacity" : "85" , "size" : "6"}}] , "sharedWith" : { "users" : [ ] , "groups" : [ ]} , "isCommon" : false , "autoRefresh" : false , "refreshInterval" : "30" , "&#95;id" : { "$oid" : "55c52cf6c4aa31b24b04d620"} , "geoFilter" : { "boundaryType" : "within" , "boundary" : ""}}
</code>
</p>

<p><b>DELETE</b><br>
Delete a query given the query’s internal Id on the URL path.
</p>

<p><b>Sample Request</b><br>
<b>URL:</b>
<br>
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

<ul>
<li>HTTP 401 is returned when users/token is called and authentication fails.
</li>
<li>HTTP 403 is returned when current user does not have appropriate permissions to access a requested resource. This error code is also returned when the authentication database is unavailable.
</li>
<li>HTTP 200 is returned for any successful request or any handled exceptions. To detect a failure, look for an error object. In case of failure, an error objectis returned with the format below:
</li>
</ul>

<code>
<p>{ </p>
<p> “error”: {
</p>
 <p>“code”: “&lt;error code&gt;”
</p>
<p>“message”: “&lt;error message&gt;” </p>
<p>} </p>
<p>} </p>
</code>

<p>where <i>&lt;error code&gt;</i> is a code corresponding to the error that
occurred and <i>&lt;error message&gt;</i> is a description of the error.
</p>

<ul>
<li>HTTP 500 for any unhandled system errors. The response body will contain details about the error. In most cases, (and this depends on the server infrastructure where the service is deployed) the response body will be an HTML-formatted text.
</li>

<li>HTTP 204 (No Content) is returned when an object is deleted successfully (DELETE method where applicable).
</li>
</ul>

<br>

<a href="#top">Back to top</a>
