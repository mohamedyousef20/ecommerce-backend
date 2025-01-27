const sanitizeUser = (user) => {
    return ({
        _id: user._id,
        name: user.name,
        profileImage: user.profileImage,
        email: user.email,
        wishList: user.wishList,
        active: user.active,
        role: user.role,
    })
}
export default sanitizeUser