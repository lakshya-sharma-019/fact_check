const textarea = document.getElementById("longInput");
const charCount = document.getElementById("charCount");
textarea.addEventListener("input", () => {
    charCount.textContent = `${textarea.value.length} / 3000`;
});
const API_ENDPOINT = 'https://fact-check-backend.onrender.com/';
console.log(textarea.value)
document.getElementById("AI_review_cta").addEventListener("click", async function (e) {
    e.preventDefault();
    // const pendingContainer = document.getElementById('pendingRequests');
    const completedContainer = document.getElementById('completedRequests');
    document.getElementById("AI_review_cta").innerHTML='Analysing Input..'
    document.getElementById("AI_review_cta").style.backgroundColor = "#808080";
    document.getElementById("AI_review_cta").style.color = "#ffffff";
    document.getElementById("AI_review_cta").style.borderColor = "#ffffff";
    // green color
    // button.style.color = "#ffffff";  
    try {
    console.log(JSON.stringify({ input_text: textarea.value }));
    const res = await fetch(`${API_ENDPOINT}/submit/now/all/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        "user_id": "1",
        "input_text": textarea.value})
    });
    if (!res.ok) {
    const errorData = await res.json();
    console.error("Error Response:", errorData);
    throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    console.log('awaiting API response')
    console.log('data is', data)
    document.getElementById("AI_review_cta").innerHTML='Get AI Review'
    document.getElementById("AI_review_cta").style.backgroundColor = "#ffffff";
    document.getElementById("AI_review_cta").style.color = "#ff3131";
    document.getElementById("AI_review_cta").style.borderColor = "#ff3131";
    // const data = await res.json();
    // const response = data.report;
    // console.log('response is', response)
    async function loadFactCheck(response) {

        const completedContainer = document.getElementById('completedRequests');
        completedContainer.innerHTML = ''
        // console.log('response is ', data)
        // console.log('report is ', data['report'])
        // Convert Markdown to HTML
        console.log(response.analysis)
        const div = document.createElement('div');
        const rawHtml = marked.parse(response.analysis);  
        const safeHtml = DOMPurify.sanitize(rawHtml);
        div.innerHTML = safeHtml;
        div.className = 'analysis-text';
        completedContainer.appendChild(div);
        }          
        
    loadFactCheck(data);
    
    function displayClaims(data) {
    const claimsContainer = document.getElementById('claims-container');
    claimsContainer.innerHTML = ''; // Clear loading text or previous content
    for(i=0; i<data.claimwise_supports.length;i++){
        claimData=data.claimwise_supports[i]
        console.log('claimData is',claimData)
        const claimDiv = document.createElement('div');
        claimDiv.classList.add('claim-container');

        // Claim Text
        const claimText = document.createElement('div');
        claimText.classList.add('claim-text');
        claimText.innerHTML = claimData.text;
        claimDiv.appendChild(claimText);

        // Supports container
        const supportsDiv = document.createElement('div');
        supportsDiv.classList.add('supports');

        // Populate support URLs
        claimData.supports.forEach(support => {
        console.log('support is', support)
        const url = data.id_uri_mapping[support.source_id] || '#';
        const supportBox = document.createElement('a');
        supportBox.classList.add('support-box');
        supportBox.href = url;
        supportBox.target = "_blank"; // Open URL in new tab
        supportBox.textContent = `${data.uri_title_mapping[url]} | Confidence: ${(support.confidence * 100).toFixed(1)}%`;
        supportsDiv.appendChild(supportBox);
        });
        claimDiv.appendChild(supportsDiv);
        claimsContainer.appendChild(claimDiv);
    };
    }
    console.log(data.claimwise_supports)
    displayClaims(data)
}
catch (err) {
    console.error(err);
    alert("Server error. Try again.");
}
});

  
