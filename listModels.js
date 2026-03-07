const API_KEY = "AIzaSyA8T_Ds-Lryz9OdAVh42IMAFMTpfProlbA";

async function run() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
  );

  const data = await res.json();

  console.log(JSON.stringify(data, null, 2));
}

run();