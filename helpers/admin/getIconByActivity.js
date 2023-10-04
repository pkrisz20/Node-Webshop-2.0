function getIconByActivity (status = 0) {
    status = Boolean(status);
    return status ? '<i class="fas fa-check-circle link-success fs-5"></i>' : '<i class="fas fa-times-circle link-danger fs-5"></i>';
}

module.exports = { getIconByActivity };
