document.querySelector('button').addEventListener('click', fetchTime);

// Convert 24-hour time to 12-hour format with AM/PM
function to12HourFormat(time) {
  if (!time) return 'N/A'; // Handle missing time
  let [hour, minute] = time.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // Convert 0 to 12 for midnight
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

async function fetchTime() {
  try {
    const cityInput = document.querySelector('#city').value.trim();
    const countryInput = document.querySelector('#country').value.trim();

    if (!cityInput || !countryInput) {
      alert('Please enter both city and country');
      return;
    }

    // Lowercase for backend query
    const city = cityInput.toLowerCase();
    const country = countryInput.toLowerCase();

    const response = await fetch(`/get-prayer-times?city=${city}&country=${country}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log('Prayer Times:', data);

    document.querySelector('#output').innerHTML = `
      <p><strong>City:</strong> ${cityInput}</p>
      <p><strong>Country:</strong> ${countryInput}</p>
      <p><strong>Fajr:</strong> ${to12HourFormat(data.Fajr)}</p>
      <p><strong>Dhuhr:</strong> ${to12HourFormat(data.Dhuhr)}</p>
      <p><strong>Asr:</strong> ${to12HourFormat(data.Asr)}</p>
      <p><strong>Maghrib:</strong> ${to12HourFormat(data.Maghrib)}</p>
      <p><strong>Isha:</strong> ${to12HourFormat(data.Isha)}</p>
    `;

    // Refresh history after fetching new prayer times
    fetchHistory();

  } catch (error) {
    console.error('Error fetching prayer times:', error);
    document.querySelector('#output').innerHTML = `
      <p style="color:red;">Could not fetch prayer times. Please try again.</p>
    `;
  }
}

// Fetch and display search history
function fetchHistory() {
  fetch('/search-history')
    .then(res => res.json())
    .then(data => {
      const historyContainer = document.querySelector('#history');
      historyContainer.innerHTML = ''; // Clear old history

      if (data.length === 0) {
        historyContainer.innerHTML = '<p>No search history found.</p>';
        return;
      }

      const list = document.createElement('ul');
      data.forEach(item => {
        const city = item.city.charAt(0).toUpperCase() + item.city.slice(1);
        const country = item.country.charAt(0).toUpperCase() + item.country.slice(1);
        const date = new Date(item.date).toLocaleString(); // Human-readable date

        const li = document.createElement('li');
        li.textContent = `${city}, ${country} - ${date}`;
        list.appendChild(li);
      });
      historyContainer.appendChild(list);
    })
    .catch(err => console.error('Error fetching history:', err));
}

// Load history on page load
fetchHistory();
