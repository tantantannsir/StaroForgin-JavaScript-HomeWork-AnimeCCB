import axios from 'axios';

const BGM_API = 'https://api.bgm.tv';
const APP_ID = "bgm4111685b9a191e581";
const USER_AGENT = "StaroFogin/my-private-project";
const ACCESS_TOKEN = "ZTCaiNBSkimA4ZueBHxI0rKOj9CvqPVZPxLdXs00";

export async function searchCharacters(name){
    //console.log("Searching for character:",name);
    try{
        //console.log("Before Search");
        const response = await axios.post(
            'https://api.bgm.tv/v0/search/characters',
            {
                "keyword" : name,
                "filter" : {
                    "nsfw" : false
                }
            },
            {
                headers: {
                    //'User-Agent' : USER_AGENT,
                    'Authorization' : `Bearer ${ACCESS_TOKEN}`
                }
            }
        );
        //console.log("After Search:",response);
        return response.data;
    }catch(error){
        console.error("Error fetching character data",error);
        return null;
    }
}

export async function getCharacterById(characterId){
    //console.log("Fetching character by ID:",characterId);
    try {
        const response = await axios.get(`https://api.bgm.tv/v0/characters/${characterId}`,{
            headers: {
                //'User-Agent' : USER_AGENT,
                'Authorization' : `Bearer ${ACCESS_TOKEN}`
            }
        });
        return response.data;
    }catch(error){
        console.error("Error fetching character data:", error);
        return null;
    }
}

export async function getRelatedSubjects(characterId){
    try{
        const response = await axios.get(`https://api.bgm.tv/v0/characters/${characterId}/subjects`,{
            headers: {
                //'User-Agent' : USER_AGENT,
                'Authorization' : `Bearer ${ACCESS_TOKEN}`
            }
        });
        return response.data || [];
    }catch(error){
        console.error("Error fetching subkects:",error);
        return [];
    }
}

async function getSubjectById(subjectId){
    try{
        const response = await axios.get(`https://api.bgm.tv/v0/subjects/${subjectId}`,{
            headers: {
                //'User-Agent' : USER_AGENT,
                'Authorization' : `Bearer ${ACCESS_TOKEN}`
            }
        });
        return response.data;
    }catch(error){
        console.error("Error fetching subjects data:",error);
        return null;
    }
}

function hasNumber(str) {
    return /\d/.test(str);
}

export async function checkAllSubjects(subjects){
    const results = {};
    results.length = subjects.length;
    for(let item of subjects){
        try{
            const temp = await getSubjectById(item.id);
            if(temp.date != null){
                const [year, month, day]=temp.date.split('-').map(Number);
                if(results.latest == null)
                    results.latest = {year, month, day};
                else if(results.latest.year < year)
                    results.latest = {year, month, day};
                else if(results.latest.year == year && results.latest.month < month)
                    results.latest = {year, month, day};
                else if(results.latest.year == year && results.latest.month == month && results.latest.day < day)
                    results.latest = {year, month, day};
                if(results.oldest == null)
                    results.oldest = {year, month, day};
                else if(results.oldest.year > year)
                    results.oldest = {year, month, day};
                else if(results.oldest.year == year && results.oldest.month > month)
                    results.oldest = {year, month, day};
                else if(results.oldest.year == year && results.oldest.month == month && results.oldest.day > day)
                    results.oldest = {year, month, day};
            }
            if(temp.rating != null && temp.rating.score != null){
                if(results.maxrating == null)
                    results.maxrating = temp.rating.score;
                else if(results.maxrating < temp.rating.score)
                    results.maxrating = temp.rating.score;
            }
            if(temp.tags != null){
                if(results.tags == null) results.tags = [];
                for(let item of temp.tags){
                    let flag = false;
                    if(hasNumber(item.name))
                        continue;
                    for(let tag of results.tags)
                        if(tag.name === item.name){
                            tag.count = tag.count + item.count;
                            flag = true;
                        }
                    if(!flag)results.tags.push(item);
                }
            }
        }catch(error){
            console.error("Error getting subject:",error);
        }
    }
    if(results.tags != null)
        results.tags.sort((a, b) => b.count - a.count);
    return results;
}
//console.log(getRelatedSubjects(1));