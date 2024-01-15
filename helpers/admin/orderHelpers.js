// Order statuses
// @new
// @in process
// @done
// @canceled
var orderStatuses = {
    statusNames: ['done', 'canceled', 'new', 'in process'],
    done: "Lezárt",
    canceled: "Lemondott",
    in_process: "Folyamatban",
    new: "Új",
}

function getOrderStatus (status = "new") {

    let statusData = {
        statusText: "Új",
        statusClass: "bg-secondary"
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

function isOrderStatusEditable (status) {
    return status !== 'done' && status !== 'canceled';
}

// Returns the order statuses except the current status, which can not be selected
function getAvailableOrderStatuses (currentStatus) {
    return orderStatuses.statusNames.filter(status => status !== currentStatus);
}

module.exports = { getOrderStatus, isOrderStatusEditable, getAvailableOrderStatuses };
