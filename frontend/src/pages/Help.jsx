import { BrainCircuit, FileSpreadsheet } from "lucide-react";

export default function Help() {
    return (
        <div className="flex flex-col gap-8 rise">
            <section className="grid grid-cols-1 gap-8">
                
                {/* AI Explainability */}
                <div className="border border-rule bg-card overflow-hidden">
                    <div className="p-4 border-b border-rule bg-paper/50 flex items-center gap-3">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        <h3 className="font-display text-xl text-ink">AI Explainability</h3>
                    </div>
                    <div className="p-6 flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <h4 className="font-medium text-ink text-lg">Turnover Risk Model</h4>
                            <p className="text-muted-foreground leading-relaxed">
                                The Turnover Risk model predicts the probability of an employee leaving the company within the next 6 months. 
                                It uses a Random Forest classifier trained on historical attrition data. The top contributing factors are:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                                <li><strong>Tenure & Career Stagnation:</strong> Employees in the same role for &gt;3 years without a title change.</li>
                                <li><strong>Pay Equity:</strong> Distance from the median salary for their specific job title and level.</li>
                                <li><strong>Performance Drops:</strong> A sharp decline in performance ratings over consecutive cycles.</li>
                            </ul>
                        </div>

                        <div className="border-t border-rule"></div>

                        <div className="flex flex-col gap-2">
                            <h4 className="font-medium text-ink text-lg">Behavioral Risk & Burnout</h4>
                            <p className="text-muted-foreground leading-relaxed">
                                Behavioral Risk is calculated dynamically to detect burnout and disengagement. It aggregates daily or weekly activity metrics.
                                A base score of 1.0 represents an average employee. Scores above 1.25 are flagged as "High Risk".
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                                <li><strong>Absenteeism:</strong> Frequency and duration of unplanned absences.</li>
                                <li><strong>Engagement Scores:</strong> Sentiment extracted from pulse surveys.</li>
                                <li><strong>Manager 1-on-1s:</strong> Frequency of check-ins with direct managers.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Data Formatting Guide */}
                <div className="border border-rule bg-card overflow-hidden">
                    <div className="p-4 border-b border-rule bg-paper/50 flex items-center gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <h3 className="font-display text-xl text-ink">Data Formatting Guide</h3>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                        <p className="text-muted-foreground leading-relaxed">
                            When uploading new employee datasets via the <strong>Data Upload</strong> page, ensure your CSV files adhere to the following schema to guarantee accurate AI predictions.
                        </p>

                        <div className="overflow-x-auto border border-rule">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-rule bg-paper/20">
                                        <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Column Name</th>
                                        <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Data Type</th>
                                        <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Description</th>
                                        <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Required</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rule/50">
                                    <tr className="hover:bg-accent/10">
                                        <td className="py-3 px-4 font-medium text-ink font-mono text-xs">EmployeeID</td>
                                        <td className="py-3 px-4 text-muted-foreground">String</td>
                                        <td className="py-3 px-4 text-muted-foreground">Unique identifier for the employee.</td>
                                        <td className="py-3 px-4 text-destructive font-medium">Yes</td>
                                    </tr>
                                    <tr className="hover:bg-accent/10">
                                        <td className="py-3 px-4 font-medium text-ink font-mono text-xs">Department</td>
                                        <td className="py-3 px-4 text-muted-foreground">String</td>
                                        <td className="py-3 px-4 text-muted-foreground">The department name (e.g., Engineering, Sales).</td>
                                        <td className="py-3 px-4 text-destructive font-medium">Yes</td>
                                    </tr>
                                    <tr className="hover:bg-accent/10">
                                        <td className="py-3 px-4 font-medium text-ink font-mono text-xs">Salary</td>
                                        <td className="py-3 px-4 text-muted-foreground">Integer</td>
                                        <td className="py-3 px-4 text-muted-foreground">Annual base salary in USD.</td>
                                        <td className="py-3 px-4 text-success font-medium">No</td>
                                    </tr>
                                    <tr className="hover:bg-accent/10">
                                        <td className="py-3 px-4 font-medium text-ink font-mono text-xs">PerformanceRating</td>
                                        <td className="py-3 px-4 text-muted-foreground">Float (1.0 - 5.0)</td>
                                        <td className="py-3 px-4 text-muted-foreground">Latest review score.</td>
                                        <td className="py-3 px-4 text-destructive font-medium">Yes</td>
                                    </tr>
                                    <tr className="hover:bg-accent/10">
                                        <td className="py-3 px-4 font-medium text-ink font-mono text-xs">AttritionFlag</td>
                                        <td className="py-3 px-4 text-muted-foreground">Boolean (0 or 1)</td>
                                        <td className="py-3 px-4 text-muted-foreground">1 if the employee left, 0 if active.</td>
                                        <td className="py-3 px-4 text-destructive font-medium">Yes</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
}
