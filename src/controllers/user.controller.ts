import { asyncHandler } from "../utils/asyncHandler";
import {ApiError} from "../utils/ApiError"
import { User, IUser} from "../models/user.model"
import {uploadOnCloudinary} from "../utils/cloudinary"
import { ApiResponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Request, Response } from "express";

const generateAccessAndRefreshTokens = async(userId: mongoose.Types.ObjectId) =>{
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const accessToken = (user as any).generateAccessToken()
        const refreshToken = (user as any).generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req: Request, res: Response) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const files = req.files as any;
    const avatarBuffer = files?.avatar?.[0]?.buffer;
    
    let coverImageBuffer;
    if (files && files.coverImage && Array.isArray(files.coverImage) && files.coverImage.length > 0) {
        coverImageBuffer = files.coverImage[0]?.buffer
    }
    
    if (!avatarBuffer) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarBuffer)
    const coverImage = coverImageBuffer ? await uploadOnCloudinary(coverImageBuffer) : null

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser.toObject(), "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req: Request, res: Response) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if (!username || !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id as mongoose.Types.ObjectId)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "User not authenticated")
    }
    
    await User.findByIdAndUpdate(
        user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET!
        ) as any
    
        const user = await User.findById(decodedToken?._id )
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id as mongoose.Types.ObjectId)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error: any) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})



const getCurrentUser = asyncHandler(async(req: Request, res: Response) => {
    const user = req.user;
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "User not authenticated")
    }
    
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, {
        $set: {
            fullName,
            email
        }
    },
    {new: true}).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Account details updated successfully"))
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
}
