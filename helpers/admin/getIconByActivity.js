function getIconByActivity (status = 0) {
    status = Boolean(status);
    return status ? '<i class="fas fa-check-circle link-success"></i>' : '<i class="fas fa-times-circle link-danger"></i>';
}

module.exports = { getIconByActivity };
