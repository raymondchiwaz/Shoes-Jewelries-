const https = require('https');

const data = JSON.stringify({
    weight: 1000,
    currency_code: "usd"
});

const options = {
    hostname: 'www.shiprank.info',
    port: 443,
    path: '/api/calculate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);

    let body = '';
    res.on('data', (d) => {
        body += d;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(body);
            console.log("Response Data:");
            if (Array.isArray(parsed)) {
                parsed.forEach(opt => {
                    console.log(`- ID: ${opt.id}, Name: ${opt.name}`);
                });
            } else {
                console.log(parsed);
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
            console.log("Raw Body:", body);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
