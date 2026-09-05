package com.athlon.tournamentservice.streaming;

public enum StreamProfile {
    HD_720P_30(1280, 720, 30, "4000k", "4000k", "8000k", 60),
    FHD_1080P_30(1920, 1080, 30, "8000k", "8000k", "16000k", 60),
    FHD_1080P_60(1920, 1080, 60, "10000k", "12000k", "24000k", 120);

    private final int width;
    private final int height;
    private final int fps;
    private final String videoBitrate;
    private final String maxRate;
    private final String bufSize;
    private final int gopSize;

    StreamProfile(int width, int height, int fps, String videoBitrate, String maxRate, String bufSize, int gopSize) {
        this.width = width;
        this.height = height;
        this.fps = fps;
        this.videoBitrate = videoBitrate;
        this.maxRate = maxRate;
        this.bufSize = bufSize;
        this.gopSize = gopSize;
    }

    public int getWidth() { return width; }
    public int getHeight() { return height; }
    public int getFps() { return fps; }
    public String getVideoBitrate() { return videoBitrate; }
    public String getMaxRate() { return maxRate; }
    public String getBufSize() { return bufSize; }
    public int getGopSize() { return gopSize; }

    public static StreamProfile fromString(String val) {
        if (val == null) return HD_720P_30;
        try {
            return StreamProfile.valueOf(val.toUpperCase());
        } catch (IllegalArgumentException e) {
            return HD_720P_30;
        }
    }
}
