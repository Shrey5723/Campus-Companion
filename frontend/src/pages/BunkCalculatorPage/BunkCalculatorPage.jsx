import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition/PageTransition'
import Loader from '../../components/common/Loader/Loader'
import { useBunkCalculator } from '../../hooks/useBunkCalculator'
import styles from './BunkCalculatorPage.module.css'

// ──────────────────────────────────────────────
// Bunk Calculator Page
// Slider to select desired %, shows per-subject bunks
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

export default function BunkCalculatorPage() {
    const [percentage, setPercentage] = useState(75)
    const { bunkData, loading, calculate } = useBunkCalculator()

    const debouncedCalculate = useCallback(() => {
        calculate(percentage)
    }, [percentage, calculate])

    useEffect(() => {
        const timer = setTimeout(debouncedCalculate, 300)
        return () => clearTimeout(timer)
    }, [debouncedCalculate])

    const subjects = bunkData?.subjects ? Object.keys(bunkData.subjects) : []

    return (
        <PageTransition className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2>Bunk Calculator</h2>
                    <p>Find out how many lectures you can skip and still maintain your target attendance</p>
                </div>
            </div>

            {/* Percentage Slider */}
            <div className={styles.sliderSection}>
                <div className={styles.sliderRow}>
                    <span className={styles.sliderLabel}>Target Attendance</span>
                    <input
                        type="range"
                        min="50"
                        max="100"
                        step="1"
                        value={percentage}
                        onChange={(e) => setPercentage(Number(e.target.value))}
                        className={styles.sliderInput}
                    />
                    <span className={styles.sliderValue}>{percentage}%</span>
                </div>
            </div>

            {/* Info Banner */}
            <div className={styles.infoBanner}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
                Showing how many lectures you can bunk while maintaining {percentage}% attendance by semester end.
            </div>

            {/* Results */}
            {loading && !bunkData ? (
                <Loader text="Calculating..." />
            ) : (
                <div className={styles.resultsGrid}>
                    {subjects.map((subject, i) => {
                        const data = bunkData.subjects[subject]
                        const overall = data?.overall || {}
                        const theory = data?.theory || {}
                        const lab = data?.lab || {}

                        return (
                            <motion.div
                                key={subject}
                                className={`${styles.resultCard} ${styles[`resultCard${subject}`]}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06, duration: 0.4 }}
                            >
                                <div className={styles.resultHeader}>
                                    <span className={styles.resultSubject}>{subject}</span>
                                    <span className={`${styles.bunkBadge} ${
                                        overall.canBunk > 0 ? styles.bunkBadgePositive : styles.bunkBadgeZero
                                    }`}>
                                        {overall.canBunk > 0 ? (
                                            <>
                                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>celebration</span>
                                                Can bunk {overall.canBunk}
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                                                Can&apos;t bunk
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className={styles.resultStats}>
                                    <div className={styles.resultStatRow}>
                                        <span className={styles.resultStatLabel}>Current %</span>
                                        <span className={styles.resultStatValue}
                                            style={{ color: overall.currentPercentage >= percentage ? 'var(--success)' : 'var(--danger)' }}
                                        >
                                            {overall.currentPercentage}%
                                        </span>
                                    </div>
                                    <div className={styles.resultStatRow}>
                                        <span className={styles.resultStatLabel}>Attended / Held</span>
                                        <span className={styles.resultStatValue}>
                                            {overall.attended} / {overall.totalHeld}
                                        </span>
                                    </div>
                                    <div className={styles.resultStatRow}>
                                        <span className={styles.resultStatLabel}>Remaining Lectures</span>
                                        <span className={styles.resultStatValue}>{overall.remaining}</span>
                                    </div>
                                    <div className={styles.resultStatRow}>
                                        <span className={styles.resultStatLabel}>Theory Bunkable</span>
                                        <span className={styles.resultStatValue}
                                            style={{ color: theory.canBunk > 0 ? 'var(--success)' : 'var(--danger)' }}
                                        >
                                            {theory.canBunk}
                                        </span>
                                    </div>
                                    <div className={styles.resultStatRow}>
                                        <span className={styles.resultStatLabel}>Lab Bunkable</span>
                                        <span className={styles.resultStatValue}
                                            style={{ color: lab.canBunk > 0 ? 'var(--success)' : 'var(--danger)' }}
                                        >
                                            {lab.canBunk}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </PageTransition>
    )
}
