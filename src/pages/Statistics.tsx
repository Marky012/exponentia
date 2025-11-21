import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GemDisplay } from '@/components/GemDisplay';
import { 
  Trophy, 
  Target, 
  Zap, 
  Award, 
  Star, 
  Crown,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Statistics = () => {
  const navigate = useNavigate();
  const { 
    playerName, 
    playerGender, 
    laws, 
    quizLevels,
    totalCorrectAnswers,
    totalIncorrectAnswers
  } = useGameStore();

  // Calculate statistics
  const completedLaws = laws.filter(law => law.completed).length;
  const gemsEarned = laws.filter(law => law.gemEarned).length;
  const totalLaws = laws.length;
  const lawCompletionRate = Math.round((completedLaws / totalLaws) * 100);
  const gemCollectionRate = Math.round((gemsEarned / totalLaws) * 100);
  const totalQuestionsAnswered = totalCorrectAnswers + totalIncorrectAnswers;
  const overallAccuracy = totalQuestionsAnswered > 0 
    ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) 
    : 0;

  const completedQuizzes = quizLevels.filter(level => level.completed).length;
  const totalQuizzes = quizLevels.length;
  const highestScore = Math.max(...quizLevels.map(level => level.score || 0));
  const averageScore = quizLevels.length > 0
    ? Math.round(quizLevels.reduce((sum, level) => sum + (level.score || 0), 0) / quizLevels.length)
    : 0;

  // Chart data
  const lawProgressData = [
    { name: 'Completed with Gem', value: gemsEarned, color: 'hsl(var(--gem))' },
    { name: 'Completed', value: completedLaws - gemsEarned, color: 'hsl(var(--primary))' },
    { name: 'Incomplete', value: totalLaws - completedLaws, color: 'hsl(var(--muted))' }
  ];

  const quizScoresData = quizLevels.map(level => ({
    name: level.name,
    bestScore: level.score || 0,
    attempts: level.attempts
  }));

  // Achievement badges
  const achievements = [
    {
      id: 'first-gem',
      name: 'First Gem',
      description: 'Earned your first gem',
      icon: Sparkles,
      earned: gemsEarned >= 1,
      color: 'text-gem'
    },
    {
      id: 'half-master',
      name: 'Half Master',
      description: 'Completed 4 laws',
      icon: Star,
      earned: completedLaws >= 4,
      color: 'text-primary'
    },
    {
      id: 'full-master',
      name: 'Law Master',
      description: 'Completed all 8 laws',
      icon: Crown,
      earned: completedLaws === 8,
      color: 'text-accent'
    },
    {
      id: 'gem-collector',
      name: 'Gem Collector',
      description: 'Earned all 8 gems',
      icon: Trophy,
      earned: gemsEarned === 8,
      color: 'text-gem'
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Scored 100% on any quiz',
      icon: Target,
      earned: quizLevels.some(level => level.score === 100),
      color: 'text-primary'
    },
    {
      id: 'quiz-warrior',
      name: 'Quiz Warrior',
      description: 'Completed all quiz levels',
      icon: Zap,
      earned: completedQuizzes === totalQuizzes && totalQuizzes > 0,
      color: 'text-accent'
    },
    {
      id: 'accurate',
      name: 'Sharpshooter',
      description: '90%+ overall accuracy',
      icon: Award,
      earned: overallAccuracy >= 90,
      color: 'text-primary'
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/laws')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Laws
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-orbitron font-black mb-2 text-glow">
                {playerName}'s Statistics
              </h1>
              <p className="text-muted-foreground text-lg">
                Your journey through Exponentia
              </p>
            </div>
            <GemDisplay />
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-primary/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Gems Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gem">{gemsEarned}/{totalLaws}</div>
                <Progress value={gemCollectionRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{gemCollectionRate}% Complete</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-accent/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Overall Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{overallAccuracy}%</div>
                <Progress value={overallAccuracy} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {totalCorrectAnswers}/{totalQuestionsAnswered} Correct
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-primary/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Quiz Battles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{completedQuizzes}/{totalQuizzes}</div>
                <Progress value={(completedQuizzes / Math.max(totalQuizzes, 1)) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Highest: {highestScore}%</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-gem/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Laws Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{completedLaws}/{totalLaws}</div>
                <Progress value={lawCompletionRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{lawCompletionRate}% Complete</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Law Progress Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Law Completion Progress</CardTitle>
                <CardDescription>Your progress through the 8 Laws</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={lawProgressData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {lawProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quiz Scores Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quiz Battle Scores</CardTitle>
                <CardDescription>Best scores for each difficulty level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quizScoresData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="bestScore" fill="hsl(var(--primary))" name="Best Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-2 border-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-accent" />
                Achievements
              </CardTitle>
              <CardDescription>
                {earnedAchievements.length}/{achievements.length} Unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <Card
                        className={`p-4 transition-all duration-300 ${
                          achievement.earned
                            ? 'bg-card border-2 border-primary/50 shadow-lg'
                            : 'bg-muted/30 border border-border opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`${achievement.earned ? achievement.color : 'text-muted-foreground'}`}>
                            <Icon className="w-8 h-8" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold mb-1">{achievement.name}</h3>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            {achievement.earned && (
                              <Badge variant="default" className="mt-2 text-xs">
                                Unlocked
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiz History */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quiz Battle History</CardTitle>
              <CardDescription>Your performance in each quiz level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizLevels.map((level, index) => (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        level.completed 
                          ? 'bg-primary/20 text-primary'
                          : level.unlocked
                          ? 'bg-accent/20 text-accent'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {level.completed ? <Trophy className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold">{level.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {level.attempts} attempt{level.attempts !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {level.score || 0}%
                      </div>
                      {level.completed && (
                        <Badge variant="default" className="mt-1">
                          Completed
                        </Badge>
                      )}
                      {!level.unlocked && (
                        <Badge variant="secondary" className="mt-1">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;
