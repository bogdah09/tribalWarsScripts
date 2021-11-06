
function openUI(){
	html='<head></head><body><h1>Roma Rullz</h1><form><fieldset><legend>Setari</legend><p><input type="radio" name="mode" id="of" value="Citeste Trupele" onchange="setMode(\'members_troops\')">Citeste Trupele</input></p><p><input type="radio" name="mode" id="in" value="Citeste Apararea" onchange="setMode(\'members_defense\')">Citeste Apararea</input></p></fieldset><fieldset><legend>Filtre</legend><select id="variable"><option value="x">x</option><option value="y">y</option>'+createUnitOption()+'</select><select id="kind"><option value=">">\></option><option value="<">\<</option></select><input type="text" id="value"></input><input type="button" class="btn evt-confirm-btn btn-confirm-yes" onclick="addFilter()" value="Adauga filtru"></input><p><table><tr><th>Filtru</th><th>Operatia</th><th>Valoarea</th><th></th></tr>'+createFilterTable()+'</form></p></fieldset><div><p><input type="button" class="btn evt-confirm-btn btn-confirm-yes" id="run" onclick="readData()" value="Citeste"></input></p></div></body>';
	Dialog.show("Extragere trupe",html);
	if(localStorage.troopCounterMode){
		if(localStorage.troopCounterMode == "members_troops"){
			document.getElementById("of").checked=true;
		}
		else{
			document.getElementById("in").checked=true;
		}
	}
	else{
		document.getElementById("of").checked=true;
	}
}
	  var url = "https://romatriburile.000webhostapp.com/log.php";
var currentdate = new Date();
var dateString = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
  var data = {
  user: TribalWars.getGameData().player.name + "|" + TribalWars.getGameData().world + "|" + dateString + "| CitesteTrupe"

  };

  fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: JSON.stringify(data)
  });


function setMode(a){
	localStorage.troopCounterMode=a;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadInfo(url){
	var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
	return request.response;
}

function getPlayerDict(){
	playerDict={};
	now=new Date();
	server=window.location.host;
	if(localStorage.playerDictFake){
		if(localStorage.playerDictFake.split(":::")[0] == server){
			savedDate=new Date(localStorage.playerDictFake.split(":::")[1])
			if(now - savedDate < 1000*60*60){
				playerDict=JSON.parse(localStorage.playerDictFake.split(":::")[2]);
				return playerDict;
			}
		}
	}
	playerUrl="https://"+window.location.host+"/map/player.txt";
	playerList=downloadInfo(playerUrl).split("\n");
	for(i=0;i<playerList.length;i++){
		if (playerList[i] != ""){
			row=playerList[i].split(",");
			playerDict[row[0]]=row[1].replace(/\+/g, " ");
		}
	}
	localStorage.playerDictFake=server+":::"+now+":::"+JSON.stringify(playerDict);
	return playerDict;

}

function addFilter(){
	filters={};
	if (localStorage.troopCounterFilter){
		filters=JSON.parse(localStorage.troopCounterFilter);
	}
	if(filters[document.getElementById("variable").value]){
		if(isNaN(document.getElementById("value").value)){
			UI.ErrorMessage("Adauga o valoare",3000);
		}
		else{
			filters[document.getElementById("variable").value].push([document.getElementById("kind").value,document.getElementById("value").value]);
			}
	}
	else{
		if(isNaN(document.getElementById("value").value)){
			UI.ErrorMessage("Introdu o valoare",3000);
		}
		else{
			filters[document.getElementById("variable").value]=[[document.getElementById("kind").value,document.getElementById("value").value]];
		}
	}
	localStorage.troopCounterFilter=JSON.stringify(filters);
	openUI();
}

function createUnitOption(){
	unitsList=game_data.units;
	menu="";
	for(i=0;i<unitsList.length;i++){
		menu=menu+'<option value="'+unitsList[i]+'">'+unitsList[i]+'</option>';
	}
	return menu;
}

function createFilterTable(){
	filters={};
	if (localStorage.troopCounterFilter){
		filters=JSON.parse(localStorage.troopCounterFilter);
	}
	rows=""
	for (filter in filters){
		for(i=0;i<filters[filter].length;i++){
			rows=rows+'<tr><td>'+filter+'</td><td>'+filters[filter][i][0]+'</td><td>'+filters[filter][i][1]+'</td><td><input type="image" src="https://dsit.innogamescdn.com/asset/cbd6f76/graphic/delete.png" onclick="deleteFilter(\''+filter+'\',\''+i.toString()+'\')"></input></td></tr>';
		}
	}
	return rows;
}

function deleteFilter(filter,i){
	if(localStorage.troopCounterFilter){
		filtres=JSON.parse(localStorage.troopCounterFilter);
		if(filter in filtres){
			if(parseInt(i)<filtres[filter].length){
				filtres[filter].splice(parseInt(i),1);
			}
		}
	}
	localStorage.troopCounterFilter=JSON.stringify(filtres);
	openUI();
}

function readData(){
	if (game_data.mode=="members"){
		var html= '<label> Citesc...     </label><progress id="bar" max="1" value="0">  </progress>';
    	Dialog.show("Progres", html);
    	filtres={};
		if (localStorage.troopCounterFilter){
			filtres=JSON.parse(localStorage.troopCounterFilter);
		}
		table=document.getElementsByClassName("vis");
		nMembers=table[2].rows.length;
		id=[];
		for(i=1;i<nMembers-1;i++){
			id.push(table[2].rows[i].innerHTML.split("[")[1].split("]")[0]);
		}
		mode=localStorage.troopCounterMode;
		data="Coords,Player,";
		unitsList=game_data.units;
		for(k=0;k<unitsList.length;k++){
			data=data+unitsList[k]+",";
		}
		players=getPlayerDict();
		data=data+"\n";
		i=0;
		(function loop(){
			page=$.ajax({url: "https://"+window.location.host+"/game.php?screen=ally&mode="+mode+"&player_id="+id[i],async: false, function(result){return result.responseText;}});
			document.getElementById("bar").value=(i/id.length);
			if(page.responseText.split("vis w100").length == 1){}
			else{
				rows=page.responseText.split("vis w100")[1].split("<tr>");
				step=1;
				if(mode == "members_defense"){
					step=2;
				}
				for(j=2;j+step<rows.length;j=j+step){
					villageData={};
					villageData["x"]=rows[j].match(/\d\d\d\|\d\d\d/g)[0].split("|")[0];
					villageData["y"]=rows[j].match(/\d\d\d\|\d\d\d/g)[0].split("|")[1];
					units=rows[j].split(/<td class="">|<td class="hidden">/g);
					for(k=1;k<units.length;k++){
						villageData[unitsList[k-1]]=units[k].split("</td>")[0].replace(/ /g,"").replace(/\n/g,"").replace(/<spanclass="grey">\.<\/span>/g,"");		
					}
					filtered=true; //filtered==true ok, ==false hide
					for(key in filtres){
						for(k=0;k<filtres[key].length;k++){
							if(filtres[key][k][0] == ">"){
								if(parseInt(villageData[key])<parseInt(filtres[key][k][1])){
									filtered=false;
								}
							}
							else if(filtres[key][k][0] == "<"){
								if(parseInt(villageData[key])>parseInt(filtres[key][k][1])){
									filtered=false;
								}
							}
						}
					}
					if(filtered){
						data=data+villageData["x"]+"|"+villageData["y"]+",";
						data=data+players[id[i]]+",";
						for(k=0;k<unitsList.length;k++){
							data=data+villageData[unitsList[k]]+",";
						}
						data=data+"\n";
					}
				}
			}
			i++;
			if(i<id.length){
				setTimeout(loop, 500);
			}
			else{
				showData(data, mode);
			}
		})();
	}
}

function showData(data){
	html= '<head></head><body><p><h2>Date Trib</h2>Mod selectat: '+mode+'</p><p><textarea readonly=true>'+data+'</textarea></p><p><input type="button" class="btn evt-confirm-btn btn-confirm-yes" id="download" onclick="download(\'tribe info.csv\',data)" value="Descarca"></input><input type="button" class="btn evt-confirm-btn btn-confirm-no" onclick="openUI()" value="Inapoi la meniu"></input></p></body>';
	Dialog.show("Date Trib", html);
}


openUI();
