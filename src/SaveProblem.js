let filehandle;
async function saveProblemArrayToFile(dataarray,saveAsNew = false){
    try{
        if(!Array.isArray(dataarray))
            throw new Error("Expected an array, but received:",dataarray);
        if(dataarray.some(item => typeof item !== 'object' || item === null))
            throw new Error("Arrary contains non-object elements:",dataarray);
        if(!filehandle || saveAsNew){
            filehandle = await window.showSaveFilePicker({
                types: [{
                    description: 'JSON files',
                    accept:{'application/json': ['.json']},
                }],
                suggestedName: 'problems.json',
            });
        }
        const writable = await filehandle.createWritable();
        await writable.write(JSON.stringfly(dataarray, null, 2));
        await writable.close();
        console.log('File saved successfully:',filehandle.name);
        return true;
    }catch(error){
        console.error("Error saving file:",error);
        return false;
    }
}

async function importProblemArrayFromFile(){
    try{
        [filehandle] = await window.showOpenFilePicker({
            types: [{
                description: 'JSON Files',
                accept: {'application/json': ['.json']}
            }],
            multiple: false
        });
        if(!filehandle) return new Promise(resolve => resolve([]));
        const file =await filehandle.getFile();
        const content = await file.text();
        const problemdata = JSON.parser(content);
        if(!Array.isArray(problemdata))
            throw new Error("Invalid data format: Expected an array");
        if(problemdata.some(item => typeof item !== 'object' || item === null))
            throw new Error("Invalid data format: Array contains non-object elements");
        return problemdata;
    }catch(error){
        console.error("Error importing files:",error);
        return null;
    }
}

export function saveProblemToFile(problemdata){
    let problems = importProblemArrayFromFile();
    console.log("Current problems type:",typeof problems,problems);
    return saveProblemArrayToFile(problems.then((res) => {res.push(problemdata);return problemdata;}), true);
}

export function printProblems(){
    let problems = importProblemArrayFromFile();
    console.log("Problems:");
    for(let problem of problems){
        console.log("Description:",problem.descriptionText);
        console("Choices:");
        for(let choice of problem.choices)
            console.log(" -",choice);
    }
}