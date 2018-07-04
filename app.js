
const apiKey = 'd99617fc7cab40e89c29c438d220d9a9';
const main = document.querySelector('main');
const sourceSelector = document.querySelector('#sourceSelector');
const defaultSource = 'national-geographic';
const pnotes = document.querySelector("#pnotes");
const sprint = document.querySelector("#sprint");
const defaultProjectID = 0;
const defaultSprintID = 0;
var   projID = 0;
var   sprintID = 0;
var  moveProjID = 0;
var pNoteMaster = 0;
var pNoteStatusID = 0;
var pFromStatus = '';

window.indexedDB = window.indexedDB;

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;


let DBrequest = window.indexedDB.open("TestDB",4 ),
    db,
    objectStore,
    tx;


DBrequest.onupgradeneeded = function(event)
{
    let db = DBrequest.result,
        objectStore = db.createObjectStore("notes",{keyPath:"NoteID"});

        console.log(objectStore);
}
DBrequest.onerror = function(event)
{
    alert("Allow webapp to use indexed DB");
}


DBrequest.onsuccess= function(event)
{
    
    db = DBrequest.result;
    tx = db.transaction("notes","readwrite");
    objectStore = tx.objectStore("notes");

    db.onerror= function(e)
    {
        console.log(e);
    }
}


const apiHost = 'http://localhost:62077/api';
window.addEventListener('load', async e => {

    updatePNotes();
    await updateSprint();
    // await setButtons();

    pnotes.addEventListener('change', ev => {
        moveProjID  = ev.target.value;
        updateSprint(ev.target.value);
     
        // await setButtons();
    });


    sprint.addEventListener('change',ev=>{
        sprintID  = ev.target.value;
        updateNoteList(moveProjID,sprintID);
        // await setButtons();
    });

   

    var noteUpdate = document.querySelector("#noteUpdate");
        noteUpdate.addEventListener('click',ev=>{
            // addToUpdates({NoteID:pNoteMaster,NoteStatusID:pNoteStatusID,NoteStatus:noteStatus.value})
            //  .then(()=> navigator.serviceWorker.ready)
            //  .then(reg => reg.sync.register('update-note'))
            //  .catch(()=> updateNoteStatus(pNoteMaster,pNoteStatusID,noteStatus.value))
             updateNoteStatus(pNoteMaster,pNoteStatusID,noteStatus.value)
    });

  //  updateNews();
   // await updateSources();

    // sourceSelector.value = defaultSource;

    // sourceSelector.addEventListener('change', es => {
    //     updateNews(es.target.value);
    // })

    if('serviceWorker' in navigator)
    {
        try{
            navigator.serviceWorker.register('sw.js');

            navigator.serviceWorker.ready.then(function(swRegistration){
                return swRegistration.sync.register('sw-sync');
            })
            console.log('SW registered');
        }
        catch(error)
        {
            console.log(error);
            console.log('SW reg failed');
        }
    }
});

function addToUpdates(noteUpdate)
{
    // NoteID:noteUpdate.noteIDpNoteMaster,NoteStatusID:pNoteStatusID,NoteStatus:noteStatus.value}
    console.log(db);
        var noteObjectStore = db.transaction("notes","readwrite")
            .objectStore("notes")
        noteObjectStore.put(noteUpdate);
       var qq = noteObjectStore.get(1);
       console.log(qq);
}

async function updatePNotes(){
    const res = await fetch(`${apiHost}/Project/0`)
    const json = await res.json();
    console.log(json);
    pnotes.innerHTML = json.projects.map(src => `<option value="${src.ProjectID}">${src.ProjectName}</option>`).join('\n');


}




// function onSaveNoteUpdate(note)
// {
//     addToUpdates(note)
//         .then(()=> navigator.serviceWorker.ready)
//         .then(reg => reg.sync.register('note-update'))
//         .catch(()=> sendNoteUpdateToServer(note));

// }

async function updateSprint(projectID = defaultProjectID)
{
    const res = await fetch(`${apiHost}/ProjectSprint?ProjectID=${projectID}&enableactive=true`)
    
    const json = await res.json();
    console.log(json);
    sprint.innerHTML = json.projectSprints.reverse().map(src =>`<option value="${src.ProjSprintID}">${src.ProjSprint}</option>`)
                .join('\n');

    await  updateNoteList(defaultProjectID,$("#sprint").val());

}



async function updateNoteList(projectID = defaultProjectID, sprintID = defaultSprintID )
{

    
    const res = await fetch(`${apiHost}/Note?ProjectID=${projectID}&EmployeeID&SprintID=${sprintID}`)
    const json = await res.json();
    
    
    main.innerHTML = json.notes.map(notes => 
      createNotes(notes)
    ).join('\n');

    await setButtons()
}
async function setButtons()
{

  var noteBTN = document.getElementsByClassName("noteBTN");
  // console.log(noteBTN)
  for(var x=0 ; x <= noteBTN.length-1;x++ ){
    // console.log(noteBTN[x]);
    noteBTN[x].addEventListener('click', ev=>{
     var data = ev.srcElement.dataset;
     console.log(data);
     loadNoteData(data.noteid, data.notetitle,data.notedesc,data.projectmasternotetypeid,data.notestatus);
     pNoteStatusID = data.notestatus;
     pNoteMaster = data.noteid;
    //  pFromStatus = data.status
  });

}

}
async function updateNoteStatus(noteMasterID,noteStatusID,fromStatusText)
{
    const res = await fetch(`${apiHost}/ProjectNoteStatus?ProjectNoteTypeID=${noteMasterID}&ProjectNoteStatusID=${noteStatusID}&FromStatusText=${fromStatusText}`,
    { method: 'put' });
    const json = await res.json();
    console.log(json);
    $("#noteModal").modal('hide');
    updateNoteList(moveProjID,sprintID)
}
function createNotes(note)
{
  
var noteDiv = `<div  class="card notecard" style="margin-bottom:2px;border-left:4px solid ${note.NoteStatusColor}">
            <div class="card-header" >
                <b>PN#${note.NoteID}:</b> 
                ${note.NoteTitle}
                <button class="btn btn-primary noteBTN" data-projectmasternotetypeid=${note.ProjMasterNoteType}
                data-status="${note.NoteStatus.NoteStatusName}"
                  data-notestatus="${note.NoteStatus.NoteStatusID}" data-noteid="${note.NoteID}" data-notetitle="${note.NoteTitle}"
                 data-notedesc="${note.NoteDescription}" style="float:right" data-toggle="modal" data-target="#noteModal" 
                >
            </div>
        </div>`;
      

return noteDiv;

}

async function loadNoteData(noteID, noteTitle,noteDesc,noteMasterID,noteStatusID){
    
    var title = document.querySelector('#noteTitle');
    var desc = document.querySelector("#noteDesc");
    title.innerHTML = `<label>${noteID} ${noteTitle}</label>`;
    desc.innerHTML =`${noteDesc}`;

    const res = await fetch(`${apiHost}/ProjectNoteStatus?ProjectNoteTypeID=${noteMasterID}&ProjectNoteStatusID=${noteStatusID}`);
    
    const json = await res.json();
    console.log(json);
    
    var statusSel =  document.getElementById("noteStatus");
    console.log(statusSel)
    statusSel.innerHTML = json.projectNoteStatus
    .map(src => ((src.IsInitial)? 
    `<option style="background-color:turquoise" value="${src.NoteStatusID}">${src.NoteStatusName}</option>`
    :`<option  value="${src.NoteStatusID}">${src.NoteStatusName}</option>`)).join('\n');
    // noteStatusID
    statusSel.value = noteStatusID;

    statusSel.addEventListener('change',ev=>{
      console.log(ev.target.value)
      pNoteStatusID = ev.target.value;
      pFromStatus = $("#noteStatus option:selected").text()
    });
 }


async function updateSources(){

    const res = await fetch(`https://newsapi.org/v2/sources?apiKey=${apiKey}`)
    const json = await res.json();
    sourceSelector.innerHTML = json.sources.map(src => `<option value="${src.id}">${src.name}</option>`).join('\n');

}

async function updateNews(source = defaultSource) {

    const res = await fetch(`https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${apiKey}`)
    const art = await res.json();
   
    // POPULATE MAIN 
    main.innerHTML = art.articles.map(createArticle).join('\n');
}


function createArticle(article){
    // GET ARTICLE
   
    return `
        <div class="article">
            <a href="${article.url}">
                <h2>${article.title}</h2>
                <img height="100" src="${article.urlToImage}">
                <p>${article.description}</p>
            </a>
        </div>
        `;
}

///CHECK CONNECTION
function isOnline () {
    var connectionStatus = document.getElementById('connectionStatus');
  
    if (navigator.onLine){
        connectionStatus.classList = "hidden"
      connectionStatus.innerHTML = 'You are currently online!';
    } else {
        connectionStatus.classList = "alert alert-warning";
      connectionStatus.innerHTML = 'You are currently offline. Any requests made will be queued and synced as soon as you are connected again.';
    }
  }

  
window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);
isOnline();