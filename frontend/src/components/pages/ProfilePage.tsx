import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, LogOut } from 'lucide-react';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { Image } from '@/components/ui/image';

export default function ProfilePage() {
  const { member, actions } = useMember();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary to-secondary dark:from-background dark:via-primary dark:to-secondary text-foreground dark:text-white transition-colors duration-300">
      <Header />
      
      <div className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Profile Header */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center border-4 border-accent/30 shadow-lg shadow-accent/20">
                    {member?.profile?.photo?.url ? (
                      <Image src={member.profile.photo.url} alt={member?.profile?.nickname || 'User'} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-accent" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center border-4 border-background">
                    <Award className="w-5 h-5 text-background" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="font-heading text-4xl font-bold text-white mb-2">
                    {member?.profile?.nickname || member?.contact?.firstName || 'User'}
                  </h1>
                  {member?.profile?.title && (
                    <p className="font-paragraph text-lg text-accent mb-4">
                      {member.profile.title}
                    </p>
                  )}
                  <div className="flex flex-col md:flex-row items-center gap-4 text-white/70">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="font-paragraph text-sm">
                        {member?.loginEmail || 'No email'}
                      </span>
                    </div>
                    {member?._createdDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-paragraph text-sm">
                          Joined {format(new Date(member._createdDate), 'MMM yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sign Out Button */}
                <Button
                  onClick={actions.logout}
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Information */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8">
                <h2 className="font-heading text-2xl font-bold text-white mb-6">
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="font-paragraph text-sm text-white/50 mb-1 block">
                      Full Name
                    </label>
                    <p className="font-paragraph text-base text-white">
                      {member?.contact?.firstName && member?.contact?.lastName
                        ? `${member.contact.firstName} ${member.contact.lastName}`
                        : member?.profile?.nickname || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="font-paragraph text-sm text-white/50 mb-1 block">
                      Email Address
                    </label>
                    <p className="font-paragraph text-base text-white">
                      {member?.loginEmail || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="font-paragraph text-sm text-white/50 mb-1 block">
                      Email Verified
                    </label>
                    <p className="font-paragraph text-base text-white">
                      {member?.loginEmailVerified ? (
                        <span className="text-accent">✓ Verified</span>
                      ) : (
                        <span className="text-destructive">Not verified</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="font-paragraph text-sm text-white/50 mb-1 block">
                      Account Status
                    </label>
                    <p className="font-paragraph text-base text-white">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                        {member?.status || 'Active'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8">
                <h2 className="font-heading text-2xl font-bold text-white mb-6">
                  Activity Stats
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <p className="font-paragraph text-sm text-white/50 mb-1">
                        Total Interviews
                      </p>
                      <p className="font-heading text-3xl font-bold text-white">0</p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <p className="font-paragraph text-sm text-white/50 mb-1">
                        Average Score
                      </p>
                      <p className="font-heading text-3xl font-bold text-white">--</p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  {member?.lastLoginDate && (
                    <div>
                      <label className="font-paragraph text-sm text-white/50 mb-1 block">
                        Last Login
                      </label>
                      <p className="font-paragraph text-base text-white">
                        {format(new Date(member.lastLoginDate), 'PPpp')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
