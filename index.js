const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

const serviceAccount = {
  type: "service_account",
  project_id: "evento-venquest",
  private_key_id: "d2a40cff4972de8d9712584a95704f6116c7c154",
  private_key: "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0xqHfuV8or2cn\\ncfNjD3l+LP+iI0qYxJod40aSR0Hs4ZsQwyS20trp/YYjs/lpkbkNnuvtVszp1Jz9\\nEqC42Ab3fgjH4jILxW90xAHCs/9mHLwPof4ObYZ/m+E0WueEGahDNJmDizS7c5Y1\\nplGmqeG15kYxHZcG0Hdy2SabLjyM2xam/dWkwxajvnaTCf3Ynwmhd0D1z6Jf016x\\nblBMTWHmr4dKaA+KW/YAhav3Sq688AQHaLs3oOCLQUvQc3Q+k7YLoAk4KdYIS58f\\nI3OqVupTSEkZCyLbblUZaYibxI+JsTyvhSvLlNOpLWYiZVYccSeKpbCNHb/GeE3R\\nkaZR7ufzAgMBAAECggEAMy0cPFKlDsaBJFiM91k1IrQodkUZZCAcJSPnIZgMoLvJ\\ngzhLV3pfwOglpkvX6rv3MFTyI1F0Vyn6e2Zfm5SEfGHwqG1vj4eIIv0uJmmAfu7Z\\nim9olbsJ3WxKl+C4M9xzlvr4DpZFCmARgQShjtX+8NjMvDDNRX+UoS26USoIuDL+\\n/lQ5ygJjxYpr7rWrvfAtBNqueBCXlzACwa2xcYwlkhFGmr9p3rIep+B2Hhc6nyD8\\nIxITWNsJdY+AVxizQoCQnisMqLID6LMfxw2nRNgzJgqAiLIa99CcGcfD0f/nULUZ\\npyRGiyElVs1E3+QRGv3qwlYKDnmB8rAgFUefmAhaIQKBgQDzZh4qMsThNUn8kCiU\\nQy936CEif4c5HO5l5BNo3rjraGSz5TaWxMeVJNKYgfFsc7xEjkRh1+Y+3P3zlRRq\\nRfxYc0P49JYskkNlDnsfjZqWxs21o57YMpqhxVqzv7FYlQs7ETviPY9mPq1RgORZ\\niRUh5+Sb/kRn3qXAwXXI9f3XkQKBgQC+IorA190KZT+0kcgA5sAYxIDcl6j9g2u6\\nF9iQQsT54LtFz37C6JmPyUp8I3b4fNdBFHdzV+LkA8WPhvxECBNM45s8DK2Gg43U\\nSUsr91JsqIkcismrX3eZFB5Rlfg8EP+NZ9bSJwVoOoPktQd+GXqMHE5pNBqBx91U\\nplzXuGstQwKBgFNWKIfcQCq32zA9j5dL9anBce7k6UC11i5OzBKBB6Gaabhqh6lR\\nkOBQ7kZHX4j5i4GRkHpLuMrXUaAf8BB/C+qg9Kn93JlALxEfxypDiqWLRg2mCxIN\\nKYKwFuEqhidFSMYdnXpWB45DcYZRcl3xoKmuQ0jh4zwJMIlx88kt6I7xAoGAa3lw\\n/yLF0lt7ECGbcU795MImqQqdPnfsC+vwwVLMrwZmNUbdu2TpcIpyrQsK89j1f9cG\\n0k8qdILhSIkfzYDXEA5UMDRmXfO81vN7J2YM1FjL8DNPXayAGSpzHODtyV4+Zfr9\\nRhtChjEVXtEpZBEY4VwawoLuPM/x/yhusI2RH6sCgYEAmxtY94hCvK0MLmibIWYP\\n0Di3J0hzXfJ9EOm5sFGM/qduUJ4cf3EVX2YGEzODmwu0nkJw7oMMpiO+6eiqT8TQ\\nuuJKLjFM6xfaMTXHCyXaRx9BliHGSp3Wkp2OwDa2OaH83oUqkauu+H3GB1oMfFUZ\\nkkjQKhZruekQKoQkn17bUtE=\\n-----END PRIVATE KEY-----\\n",
  client_email: "firebase-adminsdk-fbsvc@evento-venquest.iam.gserviceaccount.com",
  client_id: "108601278433367093613",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40evento-venquest.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://evento-venquest-default-rtdb.firebaseio.com",
});

const db = admin.database();

app.get("/", (req, res) => {
  res.send("✅ Webhook backend is up and running!");
});

app.post("/webhook", async (req, res) => {
  try {
    const intent = req.body.queryResult.intent.displayName;
    const city = req.body.queryResult.parameters["geo-city"];
    const type = req.body.queryResult.parameters["vendor-type"];

    console.log("Intent:", intent);
    console.log("City:", city);
    console.log("Vendor Type:", type);

    if (!city || !type) {
      return res.json({
        fulfillmentText: "Please provide both a city and vendor type.",
      });
    }

    const snapshot = await db.ref("Vendors").once("value");
    const vendors = snapshot.val();

    const matches = Object.values(vendors).filter((vendor) => {
      return (
        vendor.location?.toLowerCase() === city.toLowerCase() &&
        vendor.service?.toLowerCase().includes(type.toLowerCase())
      );
    });

    if (matches.length === 0) {
      return res.json({
        fulfillmentText: `Sorry, no ${type}s found in ${city}.`,
      });
    }

    const message =
      `Here are some ${type}s in ${city}:\n` +
      matches
        .map(
          (v) =>
            `${v.companyName || v.userName} (Phone: ${v.phone})`
        )
        .join("\n");

    return res.json({ fulfillmentText: message });
  } catch (err) {
    console.error("❌ Error in webhook:", err);
    return res.json({
      fulfillmentText: "Something went wrong. Please try again later.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
