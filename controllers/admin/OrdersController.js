const { db } = require("../../config/db-config");
// const { getOrderStatus } = require('../../helpers/admin/orderHelpers');
// const moment = require("moment");

const deleteOrder = (req, res) => {
    let { orderId } = req.params;

    const deleteOrderQuery = "DELETE FROM orders WHERE order_id = ?";

    db.query(deleteOrderQuery, orderId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({ status: "error" });
        }
        else {
            return res.status(200).json({ status: "success" });
        }
    });
};

module.exports = { deleteOrder };
