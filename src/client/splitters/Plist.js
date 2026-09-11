import Splitter from './Splitter';

import plist from 'plist';

class Plist extends Splitter {

    static parseRect(text) {
        let nums = String(text).match(/-?\d+(?:\.\d+)?/g);

        if(!nums || nums.length < 4) {
            return null;
        }

        return {
            x: Number(nums[0]),
            y: Number(nums[1]),
            w: Number(nums[2]),
            h: Number(nums[3])
        };
    }

    static parseSize(text) {
        let nums = String(text).match(/-?\d+(?:\.\d+)?/g);

        if(!nums || nums.length < 2) {
            return null;
        }

        return {
            w: Number(nums[0]),
            h: Number(nums[1])
        };
    }

    static check(data, cb) {
        try {
            let plistData = plist.parse(data);

            cb(
                plistData &&
                plistData.frames &&
                typeof plistData.frames === 'object' &&
                !Array.isArray(plistData.frames)
            );
        }
        catch(e) {
            cb(false);
        }
    }

    static split(data, options, cb) {

        let res = [];

        try {
            let plistData = plist.parse(data);

            if(!plistData || !plistData.frames) {
                cb(res);
                return;
            }

            let frames = plistData.frames;

            for(let name of Object.keys(frames)) {

                let item = frames[name];

                let frame = Plist.parseRect(item.frame);

                if(!frame) {
                    continue;
                }

                if(frame.w <= 0 || frame.h <= 0) {
                    continue;
                }

                let sourceSize = Plist.parseSize(item.sourceSize);

                if(!sourceSize) {
                    sourceSize = {
                        w: frame.w,
                        h: frame.h
                    };
                }

                let sourceColorRect =
                    Plist.parseRect(item.sourceColorRect);

                if(!sourceColorRect) {
                    sourceColorRect = {
                        x: 0,
                        y: 0,
                        w: frame.w,
                        h: frame.h
                    };
                }

                res.push({
                    name: Splitter.fixFileName(name),

                    frame: frame,

                    spriteSourceSize: {
                        x: sourceColorRect.x,
                        y: sourceColorRect.y,
                        w: sourceColorRect.w,
                        h: sourceColorRect.h
                    },

                    sourceSize: sourceSize,

                    rotated: item.rotated === true,

                    trimmed:
                        frame.w !== sourceSize.w ||
                        frame.h !== sourceSize.h
                });
            }
        }
        catch(e) {
        }

        cb(res);
    }

    static get type() {
        return 'Plist';
    }
}

export default Plist;
