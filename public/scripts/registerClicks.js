async function sendToDatabase(column, value) {
    let url = '/updateDatabase';
    let data = {};
    data[column] = value
    // console.log(data)

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        let ret = await res.json();
        return ret.message
    } else {
        return `HTTP error: ${res.status}`;
    }
}

async function completeSurvey() {
    let url = '/completeSurvey';
    let data = {};
    // console.log(data)

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        let ret = await res.json();
        return ret.message
    } else {
        return `HTTP error: ${res.status}`;
    }

}
