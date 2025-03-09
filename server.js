const express = require('express');
const app = express();

app.get('/licenses', (req, res) => {
    const domain = req.query.domain || 'default.domain';
    res.json({
        "domain": domain,
        "licensed?": true,
        "pay-href": "https://myfakeapi.com/get/",
        "type": "standalone",
        "until": "31.12.9999"
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});