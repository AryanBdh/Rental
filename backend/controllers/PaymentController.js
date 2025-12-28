// Payments feature removed. Keep a stub controller to avoid runtime imports elsewhere.
class PaymentController {
  create(req, res) {
    return res.status(404).json({ status: false, message: 'Payments removed' });
  }
  esewaVerify(req, res) {
    return res.status(404).json({ status: false, message: 'Payments removed' });
  }
  redirectToEsewa(req, res) {
    return res.status(404).send('Payments removed');
  }
  esewaSuccess(req, res) {
    return res.status(404).send('Payments removed');
  }
  esewaFailed(req, res) {
    return res.status(404).send('Payments removed');
  }
  getByBooking(req, res) {
    return res.status(404).json({ status: false, message: 'Payments removed' });
  }
}

export default new PaymentController();
