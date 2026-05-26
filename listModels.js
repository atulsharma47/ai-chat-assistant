const API_KEY =  "AIzaSyCD4z43gI8wvDhrva83VTJu6E3j2uCDU4A";

async function run() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
  );

  const data = await res.json();

  console.log(JSON.stringify(data, null, 2));
}

run();
