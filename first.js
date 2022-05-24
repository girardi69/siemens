 actLineNumber_cur = 0;
var actLineNumber_prev = 0;
var progName_cur = "";
var progName_prev = "";
var lastMCode_cur = 0;
var lastMCode_prev = 0;
var ncProgEndCounter_cur = 0;
var ncProgEndCounter_prev = 0;
var machineStatus = "idle";
var endOfProgram = false;
var ProjectID = ""; 
var DeviceType = "";
var ApplicationType = "";
var ClientID = "";
function getValueFromSet(state, set, name) {
 for (var i = 0;i < set.Set.Data.length;i++) {
 var v = set.Set.Data[i];
 var v = set.Set.Data[i];
 if (v.Name == name) {
 return v.Value;
 }
 }
 
 throw name + " not found in data";
}

// This function will run every increment the actProgNet time every 
0.5s when the machine is in execute mode 
startIntervalWorker(function (){
 if (machineStatus == "execute"){
 actProgNetTime_live = actProgNetTime_live + 0.5;
 publishProduction();
 } 
}, 500);
// This function will be called for every received ReadingSet
function onNewReadingSet(state, set) {
 console.log("\ncycletime.js - onNewReadingSet - set:", 
JSON.stringify(set));
 if(ClientID == ""){
 ProjectID = set.Source.ProjectID 
 DeviceType = set.Source.DeviceType;
 ApplicationType = set.Source.ApplicationType;
 ClientID = set.Source.ClientID; 
 }
 //check it the readingSet is the Status set and update the 
Status variable
 if(set.Set.Name == "MachineStatus"){
 machineStatus = getValueFromSet(state,set,"Status");
 }
 //check if readingSet is the Auxiliary set and update variables
 if(set.Set.Name == "operation")
 //if(set.Set.Name == "ncProgEndCounter")
 {
 actLineNumber_cur = 
getValueFromSet(state,set,"actLineNumber");
 progName_cur = getValueFromSet(state,set,"progName");
 lastMCode_cur = getValueFromSet(state,set,"lastMCode");
ncProgEndCounter_cur = 
getValueFromSet(state,set,"ncProgEndCounter");
 }
 //if a different program has been selected, zero both act and 
old timers
 if (progName_cur != progName_prev)
 {
 oldProgNetTime = 0;
 publishProgram();
 
 actProgNetTime_live = 0;
 publishProduction();
 }
 //if line number has changed we publish to replicate behavior 
of solution line
 if (actLineNumber_cur != actLineNumber_prev)
 {
 //publishProduction();
 }
 //if machine called M30 program has been completed. update 
timers
 if ((lastMCode_cur == 30 && lastMCode_cur != lastMCode_prev) 
|| (ncProgEndCounter_cur != ncProgEndCounter_prev))
 {
 
 endOfProgram = true;
 }
 if(endOfProgram == true && machineStatus == "execute")
 {
 oldProgNetTime = actProgNetTime_live;
 publishProgram();

actProgNetTime_live = 0;
 publishProduction();
 endOfProgram= false;
 }
 //move current variables to previous for next iteration
 actLineNumber_prev = actLineNumber_cur;
 progName_prev = progName_cur;
 lastMCode_prev = lastMCode_cur;
 ncProgEndCounter_prev = ncProgEndCounter_cur;
}
//function for publishing program dataset so code above is cleaner
function publishProgram(){
 if(ClientID != ""){
 var setInfo = {
 "Source": {
 "ProjectID": ProjectID,
 "DeviceType": DeviceType,
 "ApplicationType": ApplicationType,
 "ClientID": ClientID
 },
 "Set": {
 "Time": new Date().toISOString(),
 "Name": "program"
 }
 };
 var v = [
 {
 "Name": "oldProgNetTime",
 "Type": "float",
 "Value": oldProgNetTime
 },
 {
"Name": "progName",
 "Type": "string",
 "Value": progName_cur
 }
 ];
 setInfo.Set["Data"] = v;
 
 console.log("\ncycleTime.js - Interval - publishing:", 
JSON.stringify(setInfo));
 publishReadingSet(setInfo);
 }
}
function publishProduction(){
 if(ClientID != ""){
 var setInfo = {
 "Source": {
 "ProjectID": ProjectID,
 "DeviceType": DeviceType,
 "ApplicationType": ApplicationType,
 "ClientID": ClientID
 },
 "Set": {
 "Time": new Date().toISOString(),
 "Name": "production"
 }
 };
 var v = [
 {
 "Name": "actLineNumber",
 "Type": "int",
 "Value": actLineNumber_cur
 },
 {
 "Name": "actProgNetTime",
 "Type": "float",
 "Value": actProgNetTime_live
 }
 ];
 setInfo.Set["Data"] = v;
 
 console.log("\ncycleTime.js - Interval - publishing:", 
JSON.stringify(setInfo));
 publishReadingSet(setInfo);
 }
}
Machine status script logic for Power Line 
function getValueFromSet(state, set, name) {
 for (var i = 0;i < set.Set.Data.length;i++) {
 var v = set.Set.Data[i];
 if (v.Name == name) {
 return v.Value;
 }
 }
 
 throw name + " not found in data";
}
