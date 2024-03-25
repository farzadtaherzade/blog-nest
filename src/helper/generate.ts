export const generateRandomString = (length: number): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        slug += characters[randomIndex];
    }
    return slug;
}