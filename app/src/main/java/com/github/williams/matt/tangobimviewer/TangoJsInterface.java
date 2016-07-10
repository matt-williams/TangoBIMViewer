package com.github.williams.matt.tangobimviewer;

import com.google.atap.tangoservice.TangoCameraIntrinsics;
import com.google.atap.tangoservice.TangoPoseData;

import org.json.JSONArray;
import org.json.JSONException;
import org.xwalk.core.JavascriptInterface;
//import org.xwalk.core.JavascriptInterface;

import java.util.Arrays;

public class TangoJsInterface {
    public static final String JS_NAME = "tango";
    private double mFov = 38.07625975047091;
    private double mAspectRatio = 1;
    private String mStatus = TangoPoseData.STATUS_NAMES[TangoPoseData.POSE_UNKNOWN];
    private double[] mTranslation = new double[3];
    private double[] mRotation = new double[4];

    public TangoJsInterface() {
    }

    @JavascriptInterface
    public double getFov() {
        return mFov;
    }

    @JavascriptInterface
    public double getAspectRatio() {
        return mAspectRatio;
    }

    @JavascriptInterface
    public String getStatus() {
        return mStatus;
    }

    @JavascriptInterface
    public String getTranslation() {
        try {
            return new JSONArray(mTranslation).toString();
        } catch (JSONException e) {
            return "[0, 0, 0]";
        }
    }

    @JavascriptInterface
    public String getRotation() {
        try {
            return new JSONArray(mRotation).toString();
        } catch (JSONException e) {
            return "[0, 0, 0, 1]";
        }
    }

    public void setIntrinsics(TangoCameraIntrinsics intrinsics) {
        mFov = 2 * Math.toDegrees(Math.atan(intrinsics.height / (2 * intrinsics.fy)));
        mAspectRatio = intrinsics.width / intrinsics.height;
    }

    public void setPoseData(TangoPoseData poseData) {
        mStatus = TangoPoseData.STATUS_NAMES[poseData.statusCode];
        mTranslation = poseData.translation;
        mRotation = poseData.rotation;
    }
}
