const User = require('../models/User');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');

// Helper: fetch common data needed by the profile view
async function getProfileViewData(userId) {
    const user = await User.findById(userId).select('-password');
    const ordersCount = await Order.countDocuments({ user: userId });
    const wishlist = await Wishlist.findOne({ user: userId });
    const wishlistCount = wishlist ? wishlist.products.length : 0;

    return { user, ordersCount, wishlistCount };
}

// GET /profile
exports.getProfile = async (req, res) => {
    try {
        const { user, ordersCount, wishlistCount } = await getProfileViewData(req.session.user.id);

        if (!user) {
            return res.redirect('/login');
        }

        res.render('profile', {
            title: 'My Profile',
            user,
            error: null,
            success: null,
            ordersCount,
            wishlistCount
        });
    } catch (err) {
        console.error(err);
        res.render('profile', {
            title: 'My Profile',
            user: null,
            error: 'Something went wrong. Please try again.',
            success: null,
            ordersCount: 0,
            wishlistCount: 0
        });
    }
};

// POST /profile/update
exports.postUpdateProfile = async (req, res) => {
    try {
        const { name, phone, profileImage } = req.body;

        const user = await User.findById(req.session.user.id).select('-password');

        if (!user) {
            return res.redirect('/login');
        }

        // Keep existing values if not provided
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        // Update session with new data
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        const { ordersCount, wishlistCount } = await getProfileViewData(user._id);

        res.render('profile', {
            title: 'My Profile',
            user,
            error: null,
            success: 'Profile updated successfully.',
            ordersCount,
            wishlistCount
        });
    } catch (err) {
        console.error(err);
        const { user, ordersCount, wishlistCount } = await getProfileViewData(req.session.user.id).catch(() => ({
            user: null,
            ordersCount: 0,
            wishlistCount: 0
        }));

        res.render('profile', {
            title: 'My Profile',
            user,
            error: 'Failed to update profile. Please try again.',
            success: null,
            ordersCount,
            wishlistCount
        });
    }
};

// POST /profile/change-password
exports.postChangePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Need the password field for comparison, so fetch without excluding it
        const userWithPassword = await User.findById(req.session.user.id);

        if (!userWithPassword) {
            return res.redirect('/login');
        }

        // Validate old password
        const isMatch = await userWithPassword.comparePassword(oldPassword);
        if (!isMatch) {
            const { user, ordersCount, wishlistCount } = await getProfileViewData(req.session.user.id);

            return res.render('profile', {
                title: 'My Profile',
                user,
                error: 'Current password is incorrect.',
                success: null,
                ordersCount,
                wishlistCount
            });
        }

        // Check new password matches confirm
        if (newPassword !== confirmPassword) {
            const { user, ordersCount, wishlistCount } = await getProfileViewData(req.session.user.id);

            return res.render('profile', {
                title: 'My Profile',
                user,
                error: 'New passwords do not match.',
                success: null,
                ordersCount,
                wishlistCount
            });
        }

        // Update password (pre-save hook will hash it)
        userWithPassword.password = newPassword;
        await userWithPassword.save();

        const { user, ordersCount, wishlistCount } = await getProfileViewData(req.session.user.id);

        res.render('profile', {
            title: 'My Profile',
            user,
            error: null,
            success: 'Password changed successfully.',
            ordersCount,
            wishlistCount
        });
    } catch (err) {
        console.error(err);
        const { user, ordersCount, wishlistCount } = await getProfileViewData(req.session.user.id).catch(() => ({
            user: null,
            ordersCount: 0,
            wishlistCount: 0
        }));

        res.render('profile', {
            title: 'My Profile',
            user,
            error: 'Failed to change password. Please try again.',
            success: null,
            ordersCount,
            wishlistCount
        });
    }
};

// POST /profile/address
exports.postAddAddress = async (req, res) => {
    try {
        const { label, fullName, address, city, state, zip, phone, isDefault } = req.body;

        const user = await User.findById(req.session.user.id).select('-password');

        if (!user) {
            return res.redirect('/login');
        }

        const markDefault = isDefault === 'true' || isDefault === true || isDefault === 'on';

        // If new address is marked default, unset other defaults
        if (markDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.addresses.push({
            label: label || 'Home',
            fullName,
            address,
            city,
            state,
            zip,
            phone,
            isDefault: markDefault
        });

        await user.save();

        const { ordersCount, wishlistCount } = await getProfileViewData(user._id);

        res.render('profile', {
            title: 'My Profile',
            user,
            error: null,
            success: 'Address added successfully.',
            ordersCount,
            wishlistCount
        });
    } catch (err) {
        console.error(err);
        const { user, ordersCount, wishlistCount } = await getProfileViewData(req.session.user.id).catch(() => ({
            user: null,
            ordersCount: 0,
            wishlistCount: 0
        }));

        res.render('profile', {
            title: 'My Profile',
            user,
            error: 'Failed to add address. Please try again.',
            success: null,
            ordersCount,
            wishlistCount
        });
    }
};

// POST /profile/address/delete
exports.postDeleteAddress = async (req, res) => {
    try {
        const { addressId } = req.body;

        const user = await User.findById(req.session.user.id).select('-password');

        if (!user) {
            return res.redirect('/login');
        }

        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== addressId
        );

        await user.save();

        const { ordersCount, wishlistCount } = await getProfileViewData(user._id);

        res.render('profile', {
            title: 'My Profile',
            user,
            error: null,
            success: 'Address removed successfully.',
            ordersCount,
            wishlistCount
        });
    } catch (err) {
        console.error(err);
        const { user, ordersCount, wishlistCount } = await getProfileViewData(req.session.user.id).catch(() => ({
            user: null,
            ordersCount: 0,
            wishlistCount: 0
        }));

        res.render('profile', {
            title: 'My Profile',
            user,
            error: 'Failed to remove address. Please try again.',
            success: null,
            ordersCount,
            wishlistCount
        });
    }
};
