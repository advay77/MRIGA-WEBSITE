// Hidden "honeypot" field on every public form: people never see it, simple bots fill it in.
//
// The name must not look like anything a browser or password manager autofills. It used to be
// "website", which Chrome and password managers filled with the user's own details, so real
// people were refused with "Unable to submit this form". Avoid words such as name, email, phone,
// address, company, url, website, fax or zip here.
export const HONEYPOT_FIELD = "hp_trap_k7q";
