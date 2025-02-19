document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("analyzeBtn");
    const reviewInput = document.getElementById("review");
    const resultBox = document.getElementById("result");
    const reviewList = document.getElementById("reviewList");
    const sentimentChartCanvas = document.getElementById("sentimentChart");
    let sentimentChart;

    // Function to analyze sentiment
    analyzeBtn.addEventListener("click", async () => {
        const reviewText = reviewInput.value.trim();
        if (!reviewText) {
            alert("Please enter a review!");
            return;
        }

        try {
            // Send data to backend
            const response = await fetch("http://localhost:5000/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: reviewText })
            });
            
            const data = await response.json();
            resultBox.innerHTML = `<span class="highlight">Sentiment: ${data.sentiment}</span>`;
            resultBox.classList.add("fade-in");

            // Save review to list
            addReviewToUI(reviewText, data.sentiment);
            updateChart();
            reviewInput.value = ""; // Clear input
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to analyze sentiment. Please try again.");
        }
    });

    // Function to fetch past reviews
    async function loadReviews() {
        try {
            const response = await fetch("http://localhost:5000/reviews");
            const reviews = await response.json();
            reviewList.innerHTML = "";
            reviews.forEach(review => addReviewToUI(review.text, review.sentiment));
            updateChart();
        } catch (error) {
            console.error("Error loading reviews:", error);
        }
    }

    // Function to add review to UI
    function addReviewToUI(text, sentiment) {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<strong>${sentiment}</strong>: ${text}`;
        listItem.classList.add("fade-in");
        reviewList.prepend(listItem);
    }

    // Function to update sentiment chart
    async function updateChart() {
        const response = await fetch("http://localhost:5000/reviews");
        const reviews = await response.json();
        
        const sentimentCounts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
        reviews.forEach(review => sentimentCounts[review.sentiment]++);

        const chartData = {
            labels: ["Positive", "Negative", "Neutral"],
            datasets: [{
                label: "Sentiment Distribution",
                data: [sentimentCounts.POSITIVE, sentimentCounts.NEGATIVE, sentimentCounts.NEUTRAL],
                backgroundColor: ["#28a745", "#dc3545", "#ffc107"]
            }]
        };

        if (sentimentChart) {
            sentimentChart.destroy();
        }
        sentimentChart = new Chart(sentimentChartCanvas, { type: "doughnut", data: chartData });
    }

    // Load past reviews on page load
    loadReviews();
});
