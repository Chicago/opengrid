Auto refresh is an optional feature within the application that
could be applied to a search. It’s displayed by the number of intervals
in seconds (default is 30 seconds and maximum of 3600 seconds (60 minutes)).
Refresh component in a map can be used for monitoring, performance or updates.

When a search is submitted with auto-refresh; the data refreshes and re-plots 
itself keeping your map in sync with the latest data while the map is open.
A user can observe the latest data on the map whether it’s using the application
within the browser on a desktop or mobile device. 

![](../media/ar.jpg)
<p align="center"><b>Auto-refresh example using markers on a map.</b></p>

As the map continues to refresh, three things can occur since the initial load:

* A message appears if the search times out.
* A message appears if new data is available displaying the new count.
* The screen remains static if no new content has been made available.

### Steps to auto refresh
To enable auto-refresh of your data and base map, in
the Find Data panel -> go the auto refresh section.
Check the box for <b>“Auto-Refresh Every (SECONDS)”</b>.
Select the number of seconds required for desired auto-refresh
by using incrementing/decrementing counter or enter the number
of seconds in the auto-refresh textbox.  Select Get Data. See an
example of a WindyGrid dataset that refreshes every 20 seconds.

![](../media/arf.png)



