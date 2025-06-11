import React from 'react';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Bookmarks = () => {
  const { bookmarkedContractors, bookmarkedProjects, toggleContractorBookmark, toggleProjectBookmark } = useBookmarks();
  const navigate = useNavigate();

  const { data: contractors } = useQuery({
    queryKey: ['bookmarkedContractors', bookmarkedContractors],
    queryFn: async () => {
      if (bookmarkedContractors.length === 0) return [];
      const q = query(collection(db, 'users'), where('uid', 'in', bookmarkedContractors));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: bookmarkedContractors.length > 0
  });

  const { data: projects } = useQuery({
    queryKey: ['bookmarkedProjects', bookmarkedProjects],
    queryFn: async () => {
      if (bookmarkedProjects.length === 0) return [];
      const q = query(collection(db, 'projects'), where('__name__', 'in', bookmarkedProjects));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: bookmarkedProjects.length > 0
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
        
        <Tabs defaultValue="contractors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contractors">Contractors</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contractors">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contractors?.map((contractor: any) => (
                <Card key={contractor.uid} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">{contractor.fullName}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleContractorBookmark(contractor.uid)}
                    >
                      <Heart className="h-5 w-5 fill-blue-600 text-blue-600" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{contractor.bio || 'No bio available'}</p>
                    <Button
                      onClick={() => navigate(`/contractor/${contractor.uid}`)}
                      className="w-full"
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!contractors || contractors.length === 0) && (
                <p className="col-span-full text-center text-gray-500 py-8">
                  No bookmarked contractors yet
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="projects">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects?.map((project: any) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleProjectBookmark(project.id)}
                    >
                      <Heart className="h-5 w-5 fill-blue-600 text-blue-600" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <Button
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="w-full"
                    >
                      View Project
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!projects || projects.length === 0) && (
                <p className="col-span-full text-center text-gray-500 py-8">
                  No bookmarked projects yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bookmarks; 