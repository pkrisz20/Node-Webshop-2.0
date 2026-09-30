import * as yup from 'yup';
import { appConfig } from '../config/app';

// The maximum lengths are shared with the form inputs of the views (appConfig.forms)
const { comment, contact, order } = appConfig.forms;

export const commentSchema = yup.object({
    fullName: yup.string().required().max(comment.nameMaxLength),
    email: yup.string().email().required().max(comment.emailMaxLength),
    comment: yup.string().required().max(comment.textMaxLength),
    rating: yup.number().max(comment.maxRating),
});

export const contactSchema = yup.object({
    firstName: yup.string().required().max(contact.nameMaxLength),
    lastName: yup.string().required().max(contact.nameMaxLength),
    city: yup.string().required().max(contact.cityMaxLength),
    phone: yup.string().required().max(contact.phoneMaxLength),
    email: yup.string().email().required().max(contact.emailMaxLength),
    comment: yup.string().required().max(contact.messageMaxLength),
    recaptcha: yup.string().required(),
});

export const orderSchema = yup.object({
    firstname: yup.string().required().max(order.nameMaxLength),
    lastname: yup.string().required().max(order.nameMaxLength),
    phone: yup.string().required().max(order.phoneMaxLength),
    email: yup.string().email().required().max(order.emailMaxLength),
    city: yup.string().required().max(order.cityMaxLength),
    postcode: yup.string().required().max(order.postcodeMaxLength),
    address: yup.string().required().max(order.addressMaxLength),
    comment: yup.string().max(order.noteMaxLength),
});
