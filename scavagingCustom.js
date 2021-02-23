//PROGRAM VARIABLES
var count = 0;
var nsteps = 200;
var worker; //parallel thread for calculations
var has_archer = game_data.units.includes("archer");
var duration_factor, duration_exponent, duration_initial_seconds;
if (parseFloat(game_data.majorVersion) < 8.177) {
    var scavengeInfo = JSON.parse($('html').find('script:contains("ScavengeScreen")').html().match(/\{.*\:\{.*\:.*\}\}/g)[0]);
    duration_factor = scavengeInfo[1].duration_factor;
    duration_exponent = scavengeInfo[1].duration_exponent;
    duration_initial_seconds = scavengeInfo[1].duration_initial_seconds;
}
else {
    duration_factor = window.ScavengeScreen.village.options[1].base.duration_factor;
    duration_exponent = window.ScavengeScreen.village.options[1].base.duration_exponent;
    duration_initial_seconds = window.ScavengeScreen.village.options[1].base.duration_initial_seconds;
}
var hours = 1;
var max_spear = -1;
var max_sword = -1;
var max_axe = -1;
var max_archer = -1;
var max_light = -1;
var max_marcher = -1;
var max_heavy = -1;
var refresh_time = 60;

var haulsPerUnit = {"spear":25, "sword":15, "axe":10, "light":80, "heavy":50, "archer":10, "marcher":50, "knight":0}
var lootFactors = {0:0.1,1:0.25,2:0.5,3:0.75}


//PROGRAM VARIABLES


async function run_all()
{
    if (window.location.href.indexOf('screen=place&mode=scavenge') < 0) {
        window.location.assign(game_data.link_base_pure + "place&mode=scavenge");
    }
    createInterface();
    startWorker();

    $.ajax({url:window.location.href.split("scavenge")[0] + "units", success:successfunc});

    setTimeout(function(){
        console.log("changing_page");
        $("[class='arrowRight']").click();
        $("[class='groupRight']").click();

        setTimeout(function(){
            console.log("reloading");
            location.reload();
       }, 2000)
    }, refresh_time*1000*(1 + 0.2*Math.random()));
	
	if ((window.location.href.indexOf('village=5530') >= 0) || (window.location.href.indexOf('village=4791') >= 0) {
		$("[class='arrowRight']").click();
        $("[class='groupRight']").click();
	}
	
}

function myconsolelog(arg)
{
    var mem = JSON.stringify(arg);
    console.log(mem);
}

function inputMemory()
{
    if ("ScavengeTime" in localStorage) {
        hours = parseFloat(localStorage.getItem("ScavengeTime"));
    }

    document.getElementById("hours").value = parseFloat(hours);

    if ("max_spear" in localStorage) {
        max_spear = parseInt(localStorage.getItem("max_spear"));
    }

    document.getElementById("max_spear").value = parseInt(max_spear);

    if ("max_sword" in localStorage) {
        max_sword = parseInt(localStorage.getItem("max_sword"));
    }

    document.getElementById("max_sword").value = parseInt(max_sword);


    if ("max_axe" in localStorage) {
        max_axe = parseInt(localStorage.getItem("max_axe"));
    }

    document.getElementById("max_axe").value = parseInt(max_axe);

    if(has_archer)
    {
        if ("max_archer" in localStorage) {
            max_archer = parseInt(localStorage.getItem("max_archer"));
        }
        document.getElementById("max_archer").value = parseInt(max_archer);
    }


    if ("max_light" in localStorage) {
        max_light = parseInt(localStorage.getItem("max_light"));
    }

    document.getElementById("max_light").value = parseInt(max_light);

    if(has_archer)
    {
        if ("max_marcher" in localStorage) {
            max_marcher = parseInt(localStorage.getItem("max_marcher"));
        }
        document.getElementById("max_marcher").value = parseInt(max_marcher);
    }



    if ("max_heavy" in localStorage) {
        max_heavy = parseInt(localStorage.getItem("max_heavy"));
    }

    document.getElementById("max_heavy").value = parseInt(max_heavy);

    if ("refresh_time" in localStorage) {
        refresh_time = parseFloat(localStorage.getItem("refresh_time"));
        refresh_time = refresh_time < 10? 10 :refresh_time;
    }

    document.getElementById("refresh_time").value = parseFloat(refresh_time);
}

function acceptConfigs()
{
    hours = parseFloat(document.getElementById("hours").value);
    localStorage.setItem("ScavengeTime", hours);
    
    max_spear = parseInt(document.getElementById("max_spear").value);    
    localStorage.setItem("max_spear", max_spear);
    
        
    max_sword = parseInt(document.getElementById("max_sword").value);
    localStorage.setItem("max_sword", max_sword);
    

    max_axe = parseInt(document.getElementById("max_axe").value);
    localStorage.setItem("max_axe", max_axe);
    
    if(has_archer)
    {
        max_archer = parseInt(document.getElementById("max_archer").value);
        localStorage.setItem("max_archer", max_archer);
    }
    

    max_light = parseInt(document.getElementById("max_light").value);
    localStorage.setItem("max_light", max_light);
    

    if(has_archer)
    {
        max_marcher = parseInt(document.getElementById("max_marcher").value);
        localStorage.setItem("max_marcher", max_marcher);
    }
    

    max_heavy = parseInt(document.getElementById("max_heavy").value);
    localStorage.setItem("max_heavy", max_heavy);

    refresh_time = parseFloat(document.getElementById("refresh_time").value);
    localStorage.setItem("refresh_time", refresh_time);
    refresh_time = refresh_time < 10? 10 :refresh_time;
}

function createInterface()
{
    if ($('button').length == 0) {

        //create interface and button
        var haulCategory = 0;
        localStorage.setItem("haulCategory", haulCategory);
        var button = document.createElement("button");
        button.classList.add("btn-confirm-yes");
        button.innerHTML = "Adjust scavenge time";
        button.style.visibility = 'hidden';
        var body = document.getElementById("scavenge_screen");
        body.prepend(button);
        var scavDiv = document.createElement('div');

        if (has_archer) {
            htmlString = '<div  ID= scavTable >\
            <table class="scavengeTable" width="15%" style="border: 7px solid rgba(121,0,0,0.71); border-image-slice: 7 7 7 7; border-image-source: url(https://dsen.innogamescdn.com/asset/cf2959e7/graphic/border/frame-gold-red.png);" >\
                <tbody>\
                    <tr>\
                        <th style="text-align:center" colspan="13">Select unit types to scavenge with</th>\
                    </tr>\
                    <tr>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="spear"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_spear.png" title="Spear fighter" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="sword"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_sword.png" title="Swordsman" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="axe"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_axe.png" title="Axeman" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" cl ass="unit_link" data-unit="archer"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_archer.png" title="Archer" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="light"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_light.png" title="Light cavalry" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="marcher"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_marcher.png" title="Mounted Archer" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="heavy"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_heavy.png" title="Heavy cavalry" alt="" class=""></a></th>\
                        <th style="text-align:center" nowrap width="120">Maximum runtime</th>\
                        <th style="text-align:center" nowrap width="100">Refresh time</th>\
                    </tr>\
                    <tr>\
                        <td align="center"><input type="checkbox" ID="spear" name="spear" checked = "checked" ></td>\
                        <td align="center"><input type="checkbox" ID="sword" name="sword" ></td>\
                        <td align="center"><input type="checkbox" ID="axe" name="axe" ></td>\
                        <td align="center"><input type="checkbox" ID="archer" name="archer" ></td>\
                        <td align="center"><input type="checkbox" ID="light" name="light" ></td>\
                        <td align="center"><input type="checkbox" ID="marcher" name="marcher" ></td>\
                        <td align="center"><input type="checkbox" ID="heavy" name="heavy" ></td>\
                        <td ID="runtime" align="center"><input type="text" ID="hours" name="hours" size="1" maxlength="2" align=left > hours</td>\
                        <td align="center"><input type="text" ID="refresh_time" name="refresh_time" size="1" maxlength="3" align=left > seconds</td>\
                    </tr>\
                    <tr>\
                        <th style="text-align:center" colspan="13">Insert maximum troops to use scavenging (-1 = unlimited)</th>\
                    </tr>\
                    <tr>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_spear" value=-1 name="max_spear" checked = "checked" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_sword" value=-1 name="max_sword" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_axe" value=-1 name="max_axe" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_archer" value=-1 name="max_archer" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_light" value=-1 name="max_light" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_marcher" value=-1 name="max_marcher" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_heavy" value=-1 name="max_heavy" ></td>\
                        <td align ="center" colspan="2"><input class="btn" ID="btn-accept-configs"  type="submit" value="Accept configs" tabindex="5" onclick="acceptConfigs()"> </td>\
                    </tr>\
               </tbody>\
            </table>\
         </div>\
         ';
        } else {
            htmlString = '<div  ID= scavTable >\
            <table class="scavengeTable" width="15%" style="border: 7px solid rgba(121,0,0,0.71); border-image-slice: 7 7 7 7; border-image-source: url(https://dsen.innogamescdn.com/asset/cf2959e7/graphic/border/frame-gold-red.png);" >\
                <tbody>\
                    <tr>\
                        <th style="text-align:center" colspan="13">Select unit types to scavenge with</th>\
                    </tr>\
                    <tr>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="spear"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_spear.png" title="Spear fighter" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="sword"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_sword.png" title="Swordsman" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="axe"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_axe.png" title="Axeman" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="light"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_light.png" title="Light cavalry" alt="" class=""></a></th>\
                        <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="heavy"><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_heavy.png" title="Heavy cavalry" alt="" class=""></a></th>\
                        <th style="text-align:center" nowrap width="120">Target runtime</th>\
                        <th style="text-align:center" nowrap width="100">Refresh time</th>\
                    </tr>\
                    <tr>\
                        <td align="center"><input type="checkbox" ID="spear" name="spear" checked = "checked" ></td>\
                        <td align="center"><input type="checkbox" ID="sword" name="sword" ></td>\
                        <td align="center"><input type="checkbox" ID="axe" name="axe" ></td>\
                        <td align="center"><input type="checkbox" ID="light" name="light" ></td>\
                        <td align="center"><input type="checkbox" ID="heavy" name="heavy" ></td>\
                        <td ID="runtime" align="center"><input type="text" ID="hours" name="hours" size="1" maxlength="2" align=left > hours</td>\
                        <td align="center"><input type="text" ID="refresh_time" name="refresh_time" size="1" maxlength="3" align=left > seconds</td>\
                    </tr>\
                    <tr>\
                        <th style="text-align:center" colspan="13">Insert maximum troops to use scavenging (-1 = unlimited)</th>\
                    </tr>\
                    <tr>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_spear" value=-1 name="max_spear" checked = "checked" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_sword" value=-1 name="max_sword" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_axe" value=-1 name="max_axe" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_light" value=-1 name="max_light" ></td>\
                        <td align="center"><input type="text" size="1" maxlength="5" ID="max_heavy" value=-1 name="max_heavy" ></td>\
                        <td align ="center" colspan="2"><input class="btn" ID="btn-accept-configs"  type="submit" value="Accept configs" tabindex="5" onclick="acceptConfigs()"> </td>\
                    </tr>\
               </tbody>\
            </table>\
         </div>\
         ';
        }

        scavDiv.innerHTML = htmlString;
        scavenge_screen.prepend(scavDiv.firstChild);

        inputMemory();
    }

    if ($(".scavengeTable")[0]) {
        document.getElementById("hours").value = hours;
    }

    var checkboxValues = JSON.parse(localStorage.getItem('checkboxValues')) || {}, $checkboxes = $("#scavTable :checkbox");
    $checkboxes.on("change", function () {
        $checkboxes.each(function () {
            checkboxValues[this.id] = this.checked;
        });
        localStorage.setItem("checkboxValues", JSON.stringify(checkboxValues));
    });

    $.each(checkboxValues, function (key, value) {
        $("#" + key).prop('checked', value);
    });
}

function checkboxStatus(availableUnits) {
    if (document.getElementById("spear").checked == false) {
        availableUnits["spear"] = 0;
    }
    if (document.getElementById("sword").checked == false) {
        availableUnits["sword"] = 0;
    }
    if (document.getElementById("axe").checked == false) {
        availableUnits["axe"] = 0;
    }
    if (document.getElementById("light").checked == false) {
        availableUnits["light"] = 0;
    }
    if (document.getElementById("heavy").checked == false) {
        availableUnits["heavy"] = 0;
    }
    if (has_archer) {
        if (document.getElementById("archer").checked == false) {
            availableUnits["archer"] = 0;
        }
    }
    if (has_archer) {
        if (document.getElementById("marcher").checked == false) {
            availableUnits["marcher"] = 0;
        }
    }
    availableUnits["knight"] = 0;
}


function getAvailableUnits() {
    var availableUnits = {};
    $('.units-entry-all').each((i, e) => {
        const unitName = $(e).attr("data-unit");
        const count = $(e).text().replace(/[()]/, '');
        availableUnits[unitName] = parseInt(count);
    });

    checkboxStatus(availableUnits);

    return availableUnits;
}

function calculateHaul(units)
{
    var unitHauls = $.map(units, function(obj, key){return obj*haulsPerUnit[key]})
    var totalHaul = 0
    $.each(unitHauls,function(){totalHaul+=this || 0;});
    return totalHaul;
}

function duration(x)
{
    return ((100*x*x)**duration_exponent + duration_initial_seconds) * duration_factor
}

function resourcesperhour(x, arrayalpha, arrayfactor)
{
    return arrayalpha.reduce((acc, curr, i)=> {
        let arg = x * curr*arrayfactor[i]/nsteps;
        return acc+ (arg)/duration(arg)}, 0)
}

function getAvailableScavanges()
{
    var availableScavanges  = [3,2,1,0]

    availableScavanges  = $.grep(availableScavanges, function(obj, index){return $("[class*='free_send_button']",$($("[class^='scavenge-option']")[obj])).length > 0})
    return availableScavanges;
}

function startWorker()
{
    let workerCode = `<script id="worker1" type="javascript/worker">
        // This script won't be parsed by JS engines because its type is javascript/worker.
        function get_optimal_factors_math(haul, arrayfactor, worldSettings)
        {
            var nsteps = 200;
            let [duration_factor, duration_exponent, duration_initial_seconds] = worldSettings;

            function duration(x)
            {
                return ((100*x*x)**duration_exponent + duration_initial_seconds) * duration_factor
            }

            function resourcesperhour(x, arrayalpha)
            {
                return arrayalpha.reduce((acc, curr, i)=> {
                    let arg = x * curr*arrayfactor[i]/nsteps;
                    return acc+ (arg)/duration(arg)}, 0)
            }

            function aRange(start, end, prefix, dim, last=false)
            {
                let length = end- start+ 1;
                let arr = Array(length);
                if(last)
                {
                    let sum = prefix.reduce((a,b)=>a+b,0);
                    return Array.from(arr, (x, i) => [...prefix, start + i, dim-(start + i)-sum]);
                }
                else
                    return Array.from(arr, (x, i) => [...prefix, (start + i)]);
            }

            function oneDimSquareArrayConstructor(dim, depth){
                let dims = Array(depth).fill(dim);
                return dims.reduce(function(accumulator, curr, currDepth){
                    let newAccumulator = [];
                    for(let i=0; i < accumulator.length; i++)
                    {
                        let currAccum = accumulator[i];
                        let end = dim-currAccum.reduce((a,b)=>a+b,0);
                        if(end>=0)
                            newAccumulator.push(...aRange(0, end, currAccum, dim, Math.max(0, currDepth-depth +2)));

                    }
                    return newAccumulator;
                }, [[]])
            }
            let max = 0;
            let maxIndex = Array.from(arrayfactor,(x,i)=>0);

            let nDimarray = oneDimSquareArrayConstructor(nsteps, arrayfactor.length-1);

            for(i=0;i < nDimarray.length; i++)
            {
                let curr = nDimarray[i];
                let val = resourcesperhour(haul, curr);
                if(val > max)
                {
                    max =val;
                    maxIndex = curr;
                }
            }
            let finalTime = performance.now();

            return [max, Array.from(maxIndex, (x)=>x/nsteps)];
        }


        onmessage = ({data:args}) =>{
            console.log('Message received from main script');
            let res  = get_optimal_factors_math(...JSON.parse(args).args);
            console.log('Posting message back to main script');
            postMessage({result:res, otherStuff:JSON.parse(args).otherStuff});
        };
    </script>`

    $("#contentContainer").eq(0).prepend(workerCode);


    var blob = new Blob([document.querySelector('#worker1').textContent], {type: "text/javascript"});

    // Note: window.webkitURL.createObjectURL() in Chrome 10+.
    worker = new Worker(window.URL.createObjectURL(blob));
    worker.onmessage = ({data:output})=> {
        console.log('Message received from worker',  output);
        optimization_callBack(output.result, ...output.otherStuff)
    };
}

function get_optimal_factors(units, availableScavanges)
{    
    var availableScavanges = getAvailableScavanges();
    if(availableScavanges.length == 1)
    {
        optimization_callBack([1,[1]], units, availableScavanges);
        return
    }

    myconsolelog("availableScavanges:");
    myconsolelog(availableScavanges);
    var arrayfactor = $.map(availableScavanges, function(obj, key){return lootFactors[key]}); 
    myconsolelog("arrayfactor")
    myconsolelog(arrayfactor)
    myconsolelog("units");
    myconsolelog(units);
    var totalHaul = calculateHaul(units);
    myconsolelog("totalHaul");
    myconsolelog(totalHaul);
    worker.postMessage(JSON.stringify({args:[totalHaul, arrayfactor, [duration_factor, duration_exponent, duration_initial_seconds]], otherStuff: [units, availableScavanges]})); // Start the worker.
}

function run(availableScavanges, unitsToUse) {
    myconsolelog("initial unitsToUse");
    myconsolelog(unitsToUse);
    var units = {...unitsToUse};
    get_optimal_factors(units, availableScavanges);
}

function optimization_callBack(optimization, units, availableScavanges)
{
    scavangeType = availableScavanges.shift();
    let btn = $("[class*='free_send_button']",$($("[class^='scavenge-option']")[scavangeType]))[0];
    console.log(btn)
    var unitsToUse = {...units};
    myconsolelog("optimization haul");
    myconsolelog(optimization[0]);
    myconsolelog("optimization factors");
    myconsolelog(optimization[1]);
    var leftest_optimal = optimization[1].pop();
    myconsolelog("leftest_optimal");    
    myconsolelog(leftest_optimal);

    $.each(units, function(key, val){units[key] = parseInt(leftest_optimal*val)})
    var predHaul =lootFactors[scavangeType] * calculateHaul(units);

    var time = hours * 3600;
    var maxhaul = ((time / duration_factor - duration_initial_seconds) ** (1 / (duration_exponent)) / 100) ** (1 / 2);

    if(predHaul > maxhaul)
        $.each(units, function(key, val){units[key] = maxhaul/predHaul *val});

    myconsolelog("unitsToUse before subtracting")
    myconsolelog(unitsToUse);
    $.each(units,function(key, obj){
        unitsToUse[key] -= obj;
        $(`input.unitsInput[name='${key}']`).val(obj).trigger("change");})
    myconsolelog("unitsToUse after subtracting")
    myconsolelog(unitsToUse);
    btn.click();
    
    if(availableScavanges.length > 0)
        setTimeout(function(){run(availableScavanges, unitsToUse)}, 500*(1+0.2*Math.random()));
}

function successfunc(data)
{
    var unitNamesArray;
    if(has_archer)
        unitNamesArray = ["spear", "sword", "axe", "archer", "light", "heavy", "marcher"];
    else
        unitNamesArray = ["spear", "sword", "axe", "light", "heavy"];

    var unitsToUse = {};
    var scavanging_units = {};
    var doc = $(data);
    //Can break the script
    var scavTable = $("#content_value > table:nth-child(10)", doc)[0];
    $.each(unitNamesArray, function(index, val){
        scavanging_units[val] = scavTable? parseInt($("[class^='unit-item unit-item-" + val +"']", scavTable).last()[0].innerText):0;
    });

    var max_units;

    if(has_archer)
        max_units={"spear":max_spear, "sword":max_sword, "axe":max_axe, "archer":max_archer, "light":max_light, "heavy":max_heavy, "marcher":max_marcher};
    else
        max_units={"spear":max_spear, "sword":max_sword, "axe":max_axe, "light":max_light, "heavy":max_heavy};

    var availableUnits = getAvailableUnits();
    myconsolelog("availableUnits");
    myconsolelog(availableUnits);
    $.each(availableUnits, function(key, obj){
        if (max_units[key] == -1)
        {
            unitsToUse[key] = obj
            return
        }

        if(max_units[key] < obj + scavanging_units[key])
        {
            unitsToUse[key] = Math.max(max_units[key] - scavanging_units[key], 0);
        }
        else
            unitsToUse[key] = obj;
    })
    myconsolelog("unitsToUse");
    myconsolelog(unitsToUse);
    
    var availableScavanges = getAvailableScavanges();
    
    if(availableScavanges.length > 0)
        run(availableScavanges, unitsToUse)
}


run_all();