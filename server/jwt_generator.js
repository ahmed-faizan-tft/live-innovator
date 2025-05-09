const jwt = require("jsonwebtoken")
async function jwtGenerator(){
    const payload = {
        "iss": "Online JWT Builder",
        "iat": Math.floor(Date.now() / 1000),
        "aud": "www.example.com",
        "sub": "liveinnovator",
        // "role":"facilitator",
        // "name":"Faizan",
        // "userId":"123456789"
        // "role":"user",
        // "name":"Ahmed",
        // "userId":"121212123"
        "role":"user",
        "name":"irfan",
        "userId":"121212124"
      }
    const accessToken = await jwt.sign(payload, "liveinnovator", {
        expiresIn: '100d',
      });
      console.log(accessToken);
      
}

jwtGenerator()