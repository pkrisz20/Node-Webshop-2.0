// Order statuses
// @new
// @in process
// @done
// @canceled
function getOrderStatus (status = "new") {

    let statusData = {
        statusText: "Új",
        statusClass: ""
    }

    switch (status) {
        case "new":
            statusData.statusText = "Új";
            statusData.statusClass = "bg-secondary";
            return statusData;

        case "in process":
            statusData.statusText = "Folyamatban";
            statusData.statusClass = "bg-primary";
            return statusData;

        case "done":
            statusData.statusText = "Lezárt";
            statusData.statusClass = "bg-success";
            return statusData;

        case "canceled":
            statusData.statusText = "Lemondott";
            statusData.statusClass = "bg-danger";
            return statusData;

        default:
            return statusData;
    }
}

module.exports = { getOrderStatus };
