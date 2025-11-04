import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMicrosoft } from "react-icons/fa";

function PlayfulLetterAnimation() {
  const [activeLetterIndex, setActiveLetterIndex] = useState(-1);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [fallAnimation, setFallAnimation] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);

  const brandLetters = "ADELVATE".split("");

  useEffect(() => {
    setTimeout(() => setShowBackdrop(true), 300);

    if (activeLetterIndex < brandLetters.length - 1) {
      const timer = setTimeout(() => {
        setActiveLetterIndex((prevIndex) => prevIndex + 1);
      }, 750); 
      return () => clearTimeout(timer);
    } else if (
      activeLetterIndex === brandLetters.length - 1 &&
      !animationComplete
    ) {
      setTimeout(() => {
        setAnimationComplete(true);

        setTimeout(() => {
          setFallAnimation(true);

          setTimeout(() => {
            setFallAnimation(false);
          }, 3000); 
        }, 3000); 
      }, 800);
    }
  }, [activeLetterIndex, animationComplete, brandLetters.length]);

  const getRandom = (min, max) => Math.random() * (max - min) + min;

  const getCharColor = (idx) => {
    const colors = [
      "#60a5fa",
      "#818cf8",
      "#a78bfa",
      "#c084fc",
      "#e879f9",
      "#f472b6",
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left side with playful letter animation */}
      <div className="lg:w-1/2 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 flex items-center justify-center p-8 relative overflow-hidden">
        {showBackdrop && (
          <>
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${getRandom(1, 3)}px`,
                    height: `${getRandom(1, 3)}px`,
                    top: `${getRandom(5, 95)}%`,
                    left: `${getRandom(5, 95)}%`,
                    opacity: getRandom(0.1, 0.3),
                  }}
                  animate={{
                    opacity: [
                      getRandom(0.1, 0.3),
                      getRandom(0.4, 0.7),
                      getRandom(0.1, 0.3),
                    ],
                  }}
                  transition={{
                    duration: getRandom(2, 4),
                    repeat: Infinity,
                    delay: getRandom(0, 2),
                  }}
                />
              ))}
            </div>

            <motion.div
              className="absolute left-[10%] right-[10%] h-1 bottom-[30%] bg-gradient-to-r from-blue-400/30 via-purple-400/40 to-blue-400/30 rounded-full"
              initial={{ scaleY: 1 }}
              animate={{
                scaleY: fallAnimation ? [1, 0.6, 1.2, 1] : [1, 0.8, 1.1, 1],
              }}
              transition={{
                duration: fallAnimation ? 0.4 : 0.5,
                times: [0, 0.3, 0.6, 1],
                repeat: Infinity,
                repeatDelay: fallAnimation ? 0 : 3, 
              }}
            />

            <div className="absolute left-[15%] right-[15%] h-3 bottom-[29%] rounded-full bg-indigo-900/50 blur-md" />
          </>
        )}

        <div className="w-full max-w-2xl z-10">
          <div className="h-[50vh] sm:h-[60vh] relative flex items-center justify-center">
            {showBackdrop && (
              <motion.div
                className="absolute top-8 left-0 w-full text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              ></motion.div>
            )}

            <div className="flex justify-center items-baseline relative">
              {brandLetters.map((letter, index) => {
              
                const levelHeight = index * 35;

                const isActive = activeLetterIndex === index;
                const hasJumped = activeLetterIndex > index;
                const isPreparing = activeLetterIndex === index - 1; 
                const isFalling = fallAnimation;

                const eyeState = isFalling
                  ? "surprised"
                  : isActive
                  ? "excited"
                  : isPreparing
                  ? "alert"
                  : hasJumped
                  ? "happy"
                  : "normal";

                return (
                  <motion.div
                    key={`letter-${index}`}
                    className="relative mx-2"
                    initial={{ y: 0 }}
                    animate={{
                      y: isFalling
                        ? 
                          [
                            -levelHeight, 
                            0, 
                          ]
                        : activeLetterIndex === index
                        ? 
                          [
                            0,
                            -levelHeight - 50,
                            -levelHeight - 10,
                            -levelHeight,
                          ]
                        : activeLetterIndex > index
                        ? 
                          -levelHeight
                        :
                          0,

                      x: isFalling ? [0, 0] : 0,
                    }}
                    transition={{
                      y: isFalling
                        ? {
                            duration: 0.5,
                            delay: index * 0.1, 
                            ease: "easeIn", // Accelerate like gravity
                            times: [0, 1],
                          }
                        : {
                            duration: 1.2,
                            times: [0, 0.6, 0.8, 1],
                            ease: [0.22, 1, 0.36, 1],
                          },
                      x: {
                        duration: 0.5,
                      },
                    }}
                  >
                    <motion.div
                      // Rotation and scaling
                      animate={
                        isFalling
                          ? {
                              rotate: index % 2 === 0 ? [0, 15] : [0, -15],
                              scale: [1, 1],
                            }
                          : activeLetterIndex === index
                          ? {
                              rotate: [0, index % 2 === 0 ? -8 : 8, 0],
                              scale: [1, 1.1, 0.95, 1],
                            }
                          : {}
                      }
                      transition={{
                        rotate: isFalling
                          ? {
                              duration: 0.5,
                              delay: index * 0.1,
                              ease: "easeIn",
                            }
                          : {
                              duration: 1.2,
                              times: [0, 0.6, 0.8, 1],
                              ease: [0.22, 1, 0.36, 1],
                            },
                        scale: {
                          duration: 1.2,
                          times: [0, 0.6, 0.8, 1],
                        },
                      }}
                      className="relative"
                    >
                      {/* Letter with character face */}
                      <div className="relative">
                        <motion.div
                          animate={
                            !isFalling &&
                            animationComplete &&
                            index === brandLetters.length - 1
                              ? {
                                  y: [0, -8, 0],
                                  rotate: [0, -3, 0, 3, 0],
                                }
                              : {}
                          }
                          transition={{
                            duration: 4,
                            times: [0, 0.25, 0.5, 0.75, 1],
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }}
                        >
                          {/* The letter */}
                          <span
                            className="text-5xl sm:text-6xl font-bold tracking-wide inline-block"
                            style={{
                              color:
                                activeLetterIndex >= index || isFalling
                                  ? "#fff"
                                  : "rgba(255, 255, 255, 0.3)",
                              textShadow:
                                activeLetterIndex >= index || isFalling
                                  ? `0 4px 12px rgba(0,0,0,0.2), 0 0 5px ${getCharColor(
                                      index
                                    )}`
                                  : "none",
                              transition:
                                "color 0.5s ease, text-shadow 0.5s ease",
                            }}
                          >
                            {letter}
                          </span>

                          {/* Character face - only visible if not jumped or during active states */}
                          {(!hasJumped || isFalling) && (
                            <div className="absolute inset-0 pointer-events-none">
                              {/* Eyes */}
                              <motion.div
                                className="absolute top-[30%] left-[25%] w-1.5 h-1.5 rounded-full bg-white"
                                animate={{
                                  scale:
                                    eyeState === "excited"
                                      ? [1, 1.3, 1]
                                      : eyeState === "alert"
                                      ? [1, 1.2, 1]
                                      : eyeState === "surprised"
                                      ? 1.3
                                      : 1,
                                  height:
                                    eyeState === "surprised" ? "8px" : "6px",
                                  opacity:
                                    eyeState === "excited"
                                      ? [1, 1, 1]
                                      : eyeState === "alert"
                                      ? [1, 1, 1]
                                      : eyeState === "surprised"
                                      ? 1
                                      : eyeState === "happy"
                                      ? 0.9
                                      : 0.7,
                                }}
                                transition={{
                                  duration: eyeState === "excited" ? 0.3 : 0.2,
                                  times: [0, 0.5, 1],
                                  repeat: eyeState === "excited" ? 3 : 0,
                                }}
                              />
                              <motion.div
                                className="absolute top-[30%] right-[25%] w-1.5 h-1.5 rounded-full bg-white"
                                animate={{
                                  scale:
                                    eyeState === "excited"
                                      ? [1, 1.3, 1]
                                      : eyeState === "alert"
                                      ? [1, 1.2, 1]
                                      : eyeState === "surprised"
                                      ? 1.3
                                      : 1,
                                  height:
                                    eyeState === "surprised" ? "8px" : "6px",
                                  opacity:
                                    eyeState === "excited"
                                      ? [1, 1, 1]
                                      : eyeState === "alert"
                                      ? [1, 1, 1]
                                      : eyeState === "surprised"
                                      ? 1
                                      : eyeState === "happy"
                                      ? 0.9
                                      : 0.7,
                                }}
                                transition={{
                                  duration: eyeState === "excited" ? 0.3 : 0.2,
                                  times: [0, 0.5, 1],
                                  repeat: eyeState === "excited" ? 3 : 0,
                                }}
                              />

                              {/* Mouth */}
                              <motion.div
                                className="absolute bottom-[25%] left-1/2 -translate-x-1/2 bg-white rounded-full"
                                style={{
                                  width:
                                    eyeState === "excited" ||
                                    eyeState === "happy"
                                      ? "30%"
                                      : eyeState === "surprised"
                                      ? "25%"
                                      : "20%",
                                  height:
                                    eyeState === "excited"
                                      ? "15%"
                                      : eyeState === "happy"
                                      ? "12%"
                                      : eyeState === "surprised"
                                      ? "25%"
                                      : "2px",
                                  borderRadius:
                                    eyeState === "excited" ||
                                    eyeState === "happy" ||
                                    eyeState === "surprised"
                                      ? "9999px"
                                      : "1px",
                                }}
                                animate={{
                                  scale: isActive ? [1, 1.2, 1] : 1,
                                  opacity:
                                    eyeState === "excited"
                                      ? 1
                                      : eyeState === "happy"
                                      ? 0.9
                                      : eyeState === "surprised"
                                      ? 1
                                      : eyeState === "alert"
                                      ? 0.8
                                      : 0.6,
                                }}
                                transition={{
                                  duration: 0.3,
                                  times: [0, 0.5, 1],
                                }}
                              >
                                {(eyeState === "excited" ||
                                  eyeState === "happy" ||
                                  eyeState === "surprised") && (
                                  <div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-900/60"
                                    style={{
                                      width: "60%",
                                      height:
                                        eyeState === "surprised"
                                          ? "80%"
                                          : "40%",
                                    }}
                                  ></div>
                                )}
                              </motion.div>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {(!hasJumped || isFalling) && (
                        <>
                          <motion.div
                            className="absolute -bottom-2 left-[30%] w-1.5 rounded-full"
                            style={{
                              height: "18px",
                              transformOrigin: "top center",
                              background: getCharColor(index),
                            }}
                            initial={{ rotate: 0 }}
                            animate={{
                              // Different leg animations for different states
                              rotate: isFalling
                                ? [0, index % 2 === 0 ? 50 : 20] // Legs spread out when falling
                                : isPreparing
                                ? [0, -15, 0, -15] // Wiggle when preparing
                                : isActive
                                ? [0, -20, -60, -40] // Playful jump
                                : [0, 5, 0, -5, 0], // Idle bounce
                              scaleY: isFalling
                                ? [1, 0.7] // Compress when landing
                                : isPreparing
                                ? [1, 0.9, 1, 0.9] // Compress when preparing
                                : isActive
                                ? [0.9, 0.7, 1, 0.9] // Stretch during jump
                                : [1, 0.98, 1, 0.98, 1], // Slight bounce when idle
                            }}
                            transition={{
                              rotate: isFalling
                                ? {
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: "easeIn",
                                  }
                                : {
                                    duration: isPreparing
                                      ? 0.6
                                      : isActive
                                      ? 1
                                      : 2,
                                    times: isPreparing
                                      ? [0, 0.3, 0.7, 1]
                                      : isActive
                                      ? [0, 0.3, 0.6, 1]
                                      : [0, 0.25, 0.5, 0.75, 1],
                                  },
                              scaleY: isFalling
                                ? {
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: "easeIn",
                                  }
                                : {
                                    duration: isPreparing
                                      ? 0.6
                                      : isActive
                                      ? 1
                                      : 2,
                                    times: isPreparing
                                      ? [0, 0.3, 0.7, 1]
                                      : isActive
                                      ? [0, 0.3, 0.6, 1]
                                      : [0, 0.25, 0.5, 0.75, 1],
                                  },
                              repeat:
                                !isFalling && !isActive && !isPreparing
                                  ? Infinity
                                  : 0,
                              repeatDelay: 0.5,
                            }}
                          >
                            {/* Fun shoe */}
                            <motion.div
                              className="absolute -bottom-1.5 -left-1 w-4 h-2.5 rounded-xl"
                              style={{
                                background: getCharColor(index),
                                borderRadius:
                                  "60% 40% 50% 50% / 70% 70% 40% 40%",
                              }}
                              animate={{
                                rotate: isFalling
                                  ? [0, 20]
                                  : isPreparing
                                  ? [0, -5, 0, -5]
                                  : isActive
                                  ? [0, -15, -5]
                                  : [0, 5, 0, -5, 0],
                              }}
                              transition={{
                                duration: isFalling
                                  ? 0.5
                                  : isPreparing
                                  ? 0.6
                                  : isActive
                                  ? 1
                                  : 2,
                                times: isPreparing
                                  ? [0, 0.3, 0.7, 1]
                                  : isActive
                                  ? [0, 0.6, 1]
                                  : [0, 0.25, 0.5, 0.75, 1],
                                repeat:
                                  !isFalling && !isActive && !isPreparing
                                    ? Infinity
                                    : 0,
                                repeatDelay: 0.5,
                                delay: isFalling ? index * 0.1 : 0,
                              }}
                            />
                          </motion.div>

                          {/* Right leg with shoe */}
                          <motion.div
                            className="absolute -bottom-2 right-[30%] w-1.5 rounded-full"
                            style={{
                              height: "18px",
                              transformOrigin: "top center",
                              background: getCharColor(index),
                            }}
                            initial={{ rotate: 0 }}
                            animate={{
                              // Different leg animations for different states
                              rotate: isFalling
                                ? [0, index % 2 === 0 ? -20 : -50] // Legs spread out when falling
                                : isPreparing
                                ? [0, 15, 0, 15] // Wiggle when preparing
                                : isActive
                                ? [0, 20, 60, 40] // Playful jump
                                : [0, -5, 0, 5, 0], // Idle bounce
                              scaleY: isFalling
                                ? [1, 0.7] // Compress when landing
                                : isPreparing
                                ? [1, 0.9, 1, 0.9] // Compress when preparing
                                : isActive
                                ? [0.9, 0.7, 1, 0.9] // Stretch during jump
                                : [1, 0.98, 1, 0.98, 1], // Slight bounce when idle
                            }}
                            transition={{
                              rotate: isFalling
                                ? {
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: "easeIn",
                                  }
                                : {
                                    duration: isPreparing
                                      ? 0.6
                                      : isActive
                                      ? 1
                                      : 2,
                                    times: isPreparing
                                      ? [0, 0.3, 0.7, 1]
                                      : isActive
                                      ? [0, 0.3, 0.6, 1]
                                      : [0, 0.25, 0.5, 0.75, 1],
                                  },
                              scaleY: isFalling
                                ? {
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: "easeIn",
                                  }
                                : {
                                    duration: isPreparing
                                      ? 0.6
                                      : isActive
                                      ? 1
                                      : 2,
                                    times: isPreparing
                                      ? [0, 0.3, 0.7, 1]
                                      : isActive
                                      ? [0, 0.3, 0.6, 1]
                                      : [0, 0.25, 0.5, 0.75, 1],
                                  },
                              repeat:
                                !isFalling && !isActive && !isPreparing
                                  ? Infinity
                                  : 0,
                              repeatDelay: 0.5,
                            }}
                          >
                            {/* Fun shoe */}
                            <motion.div
                              className="absolute -bottom-1.5 -right-1 w-4 h-2.5 rounded-xl"
                              style={{
                                background: getCharColor(index),
                                borderRadius:
                                  "40% 60% 50% 50% / 70% 70% 40% 40%",
                              }}
                              animate={{
                                rotate: isFalling
                                  ? [0, -20]
                                  : isPreparing
                                  ? [0, 5, 0, 5]
                                  : isActive
                                  ? [0, 15, 5]
                                  : [0, -5, 0, 5, 0],
                              }}
                              transition={{
                                duration: isFalling
                                  ? 0.5
                                  : isPreparing
                                  ? 0.6
                                  : isActive
                                  ? 1
                                  : 2,
                                times: isPreparing
                                  ? [0, 0.3, 0.7, 1]
                                  : isActive
                                  ? [0, 0.6, 1]
                                  : [0, 0.25, 0.5, 0.75, 1],
                                repeat:
                                  !isFalling && !isActive && !isPreparing
                                    ? Infinity
                                    : 0,
                                repeatDelay: 0.5,
                                delay: isFalling ? index * 0.1 : 0,
                              }}
                            />
                          </motion.div>
                        </>
                      )}

                      {/* Falling dust puffs */}
                      {isFalling && index === activeLetterIndex && (
                        <>
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={`dust-fall-${i}`}
                              className="absolute bottom-0 rounded-full"
                              style={{
                                width: `${getRandom(2, 4)}px`,
                                height: `${getRandom(2, 4)}px`,
                                left: `${getRandom(-10, 110)}%`,
                                backgroundColor: getCharColor(
                                  (index + i) % brandLetters.length
                                ),
                              }}
                              initial={{ y: 0, opacity: 0 }}
                              animate={{
                                y: [0, getRandom(-15, -8)],
                                x: [0, getRandom(-10, 10)],
                                opacity: [0, 0.8, 0],
                              }}
                              transition={{
                                duration: 0.5,
                                times: [0, 0.4, 1],
                                delay: index * 0.1 + 0.4, // Slightly after landing
                              }}
                            />
                          ))}
                        </>
                      )}

                      {isActive && !isFalling && (
                        <>
                          {/* Jump sparkles */}
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={`sparkle-${i}`}
                              className="absolute bottom-0 rounded-full"
                              style={{
                                width: `${getRandom(2, 5)}px`,
                                height: `${getRandom(2, 5)}px`,
                                left: `${getRandom(20, 80)}%`,
                                background: getCharColor(
                                  (index + i) % brandLetters.length
                                ),
                                filter: `blur(${getRandom(0, 1)}px)`,
                              }}
                              initial={{ y: 0, opacity: 0.9, scale: 0 }}
                              animate={{
                                y: [0, getRandom(-30, -10)],
                                x: [0, getRandom(-15, 15)],
                                opacity: [0.9, 0],
                                scale: [0, getRandom(0.5, 1.5), 0],
                              }}
                              transition={{
                                duration: getRandom(0.5, 1),
                                times: [0, 0.7, 1],
                                ease: "easeOut",
                                delay: getRandom(0, 0.3),
                              }}
                            />
                          ))}
                        </>
                      )}

                      {/* Shadow beneath letter */}
                      <motion.div
                        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 rounded-full"
                        style={{
                          width: isActive || isFalling ? "15px" : "25px",
                          height: "3px",
                          background: `radial-gradient(ellipse at center, ${getCharColor(
                            index
                          )}40 0%, ${getCharColor(index)}00 70%)`,
                          opacity:
                            activeLetterIndex >= index || isFalling ? 0.8 : 0.2,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {fallAnimation === false && animationComplete && (
              <motion.div
                className="absolute bottom-10 left-0 w-full text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-sm text-blue-200/90 tracking-wide font-light">
                  Growing together
                </span>
              </motion.div>
            )}

            {/* Falling animation indicator */}
            {fallAnimation && (
              <motion.div
                className="absolute bottom-10 left-0 w-full text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-sm text-blue-200/90 tracking-wide font-light">
                  fall together
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Right side with improved login form */}
      <div className="lg:w-1/2 bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-md w-full relative"
        >
          {/* Login Card with improved UI */}
          <motion.div
            className="bg-white rounded-2xl p-10 shadow-xl"
            style={{
              boxShadow:
                "0 15px 35px -5px rgba(79, 70, 229, 0.1), 0 0 0 1px rgba(79, 70, 229, 0.05)",
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Logo/branding at top */}
       

            <div className="text-center mb-10">
              <motion.h2
                className="text-3xl font-bold text-gray-800 mb-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Welcome Back!
              </motion.h2>
              <motion.p
                className="text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                Adelvate
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97, y: 2 }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="mb-6"
            >
              <button
                className="w-full flex items-center justify-center text-white py-4 px-6 rounded-xl transition-all duration-300 relative overflow-hidden"
                style={{
                  background: isHovering
                    ? "linear-gradient(to right, #4272f5, #4f46e5)"
                    : "linear-gradient(to right, #3b82f6, #4f46e5)",
                  boxShadow: isHovering
                    ? "0 8px 20px -6px rgba(79, 70, 229, 0.4)"
                    : "0 6px 15px -6px rgba(79, 70, 229, 0.3)",
                }}
              >
                {/* Button shine effect */}
                <div
                  className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl"
                  style={{
                    opacity: isHovering ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <div
                    className="absolute top-0 -inset-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                    style={{
                      animation: isHovering
                        ? "shine 1.2s ease forwards"
                        : "none",
                    }}
                  />
                </div>

                <FaMicrosoft className="mr-3 text-xl" />
                <span className="font-medium text-lg">
                  Sign in with Microsoft
                </span>
              </button>
            </motion.div>

            {/* Decorative divider */}

            {/* Additional info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="bg-indigo-50 rounded-xl p-4"
            ></motion.div>
          </motion.div>

        </motion.div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
      `,
        }}
      />
    </div>
  );
}

export default PlayfulLetterAnimation;
