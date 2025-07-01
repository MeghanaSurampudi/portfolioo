let marksData = JSON.parse(localStorage.getItem('marksData') || '[]');
let commentsData = JSON.parse(localStorage.getItem('commentsData') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  const marksForm = document.getElementById('marksForm');
  const certificateForm = document.getElementById('certificateForm');
  const commentsList = document.getElementById('commentsList');
  const ctx = document.getElementById('performanceChart').getContext('2d');

  // Display saved faculty comments
  function renderComments() {
    if (commentsData.length === 0) {
      commentsList.innerHTML = '<p>No comments yet.</p>';
      return;
    }
    commentsList.innerHTML = '';
    commentsData.forEach(c => {
      const p = document.createElement('p');
      p.textContent = c;
      commentsList.appendChild(p);
    });
  }
  renderComments();

  // Handle marks submission
  marksForm.addEventListener('submit', e => {
    e.preventDefault();
    const semester = marksForm.semester.value;
    const marks = parseFloat(marksForm.marks.value);

    // Check if semester already exists, update it else add new
    const index = marksData.findIndex(m => m.semester === semester);
    if (index >= 0) {
      marksData[index].marks = marks;
    } else {
      marksData.push({ semester, marks });
    }

    localStorage.setItem('marksData', JSON.stringify(marksData));
    updateChart();
    marksForm.reset();
  });

  // Handle certificate upload - just alert for demo
  certificateForm.addEventListener('submit', e => {
    e.preventDefault();
    alert('Certificates uploaded successfully (demo).');
    certificateForm.reset();
  });

  // Setup Chart.js line chart to show performance trends
  let performanceChart;
  function updateChart() {
    // Sort marks by semester number
    marksData.sort((a, b) => parseInt(a.semester) - parseInt(b.semester));
    const labels = marksData.map(m => 'Sem ' + m.semester);
    const data = marksData.map(m => m.marks);

    if (performanceChart) performanceChart.destroy();

    performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Semester Marks (%)',
          data,
          borderColor: '#5C6AC4',
          backgroundColor: 'rgba(92, 106, 196, 0.2)',
          fill: true,
          tension: 0.2,
          pointRadius: 5
        }]
      },
      options: {
        scales: {
          y: {
            suggestedMin: 0,
            suggestedMax: 100
          }
        },
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
  }

  updateChart();
document.getElementById('feedbackForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const feedback = this.feedback.value.trim();

  if (name && email && feedback) {
    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, feedback }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message); // ✅ Feedback submitted successfully
        this.reset(); // clear form
      } else {
        alert(result.message || 'Something went wrong.');
      }
    } catch (error) {
      alert('❌ Error submitting feedback. Is backend running?');
      console.error(error);
    }
  } else {
    alert("Please fill in all fields ❗");
  }
});

});