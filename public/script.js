document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("leadsTableBody");

    try {
        const response = await fetch("http://localhost:8080/whatsapp/get-new-leads");
        const leads = await response.json();

        leads.forEach((lead) => {
            const services = lead.selectedServices?.length ? lead.selectedServices.join(", ") : "N/A";
            const socialMedia = lead.socialmedia?.length ? lead.socialmedia.join(", ") : "N/A";
            const priceEnquiries = lead.priceEnquiries?.length ? lead.priceEnquiries.join(", ") : "N/A";

            const callRequest = lead.isaskedforhuman
                ? `<span class="badge warning">Lead requested for a call</span>` 
                : "N/A";

            const row = `<tr>
                <td>${lead.phone}</td>
                <td>${lead.name || "N/A"}</td>
                <td>${lead.businessName || "N/A"}</td>
                <td>${lead.businessWebsite ? `<a href="https://${lead.businessWebsite}" target="_blank">${lead.businessWebsite}</a>` : "N/A"}</td>
                <td>${lead.industry || "N/A"}</td>
                <td>${lead.location || "N/A"}</td>
                <td>${lead.preferredContact || "N/A"}</td>
                <td>${services}</td>
                <td>${priceEnquiries}</td>
                <td>${socialMedia}</td>
                <td>${callRequest}</td>
            </tr>`;
            
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error fetching leads:", error);
    }
});

async function fetchLeads() {
    try {
        const response = await fetch("http://localhost:8080/whatsapp/get-new-leads");
        const leads = await response.json();

        if (leads.length === 0) {
            document.getElementById("leadsContainer").innerHTML = "<p>No new leads found.</p>";
            return;
        }

        let output = "";
        leads.forEach(lead => {
            // Add a green top border if consultation is booked
            const borderClass = lead.isConsultationBooked ? "consultation-booked" : "";

            output += `<div class="lead-card ${borderClass}">`;
            if (lead.isConsultationBooked) {
                output += `<span class="badge success">Consultation Booked</span>`;
            }

            output += `<h2>Lead ID: ${lead._id}</h2>`;

            const importantFields = {
                "Phone": lead.phone,
                "Status": lead.status,
                "Name": lead.name,
                "Email": lead.email,
                "Address": lead.address,
                "Job Place": lead.jobPlace,
                "Age": lead.age,
                "Selected Services": lead.selectedServices?.length ? lead.selectedServices.join(", ") : "N/A",
                "Business Name": lead.businessName,
                "Business Website": lead.businessWebsite,
                "Industry": lead.industry,
                "Custom Message": lead.customMessage,
                "Location": lead.location,
                "Preferred Contact": lead.preferredContact,
                "Social Media": lead.socialmedia?.length ? lead.socialmedia.join(", ") : "N/A",
                "Price Enquiries": lead.priceEnquiries?.length ? lead.priceEnquiries.join(", ") : "N/A",
                "Website Type": lead.websitetype,
                "Lead Converted": lead.isLeadConverted ? "Yes" : "No"
            };

            Object.entries(importantFields).forEach(([key, value]) => {
                if (value && value !== "N/A") {
                    output += `<p><strong>${key}:</strong> ${value}</p>`;
                }
            });

            output += "</div>";
        });

        document.getElementById("leadsContainer").innerHTML = output;
    } catch (error) {
        console.error("Error fetching leads:", error);
        document.getElementById("leadsContainer").innerHTML = "<p>Error loading leads.</p>";
    }
}
