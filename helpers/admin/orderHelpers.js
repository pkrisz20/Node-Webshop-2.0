// Order statuses
// @new
// @in process
// @done
// @canceled
var validOrderStatuses = ['done', 'canceled', 'new', 'in process'];

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
function getSelectableOrderStatuses (currentStatus) {
    let filteredStatuses = validOrderStatuses.filter(status => status !== currentStatus);
    return filteredStatuses;
}

function isValidOrderStatus (status) {
    if ( status ) {
        return validOrderStatuses.includes(status);
    }

    return false;
}

module.exports = { getOrderStatus, isOrderStatusEditable, getSelectableOrderStatuses, isValidOrderStatus };
