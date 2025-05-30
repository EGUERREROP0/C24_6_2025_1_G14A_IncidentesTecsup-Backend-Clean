export const regularExps = {
  // email
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,

  //Other with domain of tecsup
  // email: /^[a-zA-Z0-9._%+-]+@tecsup\.edu\.pe$/,
};

export const isStrongPassword = (password:string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&._-])[A-Za-z\d@$!%*?#&._-]{6,}$/;
  return regex.test(password);
}
